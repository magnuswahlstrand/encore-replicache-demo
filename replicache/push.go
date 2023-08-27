package replicache

import (
	"context"
	"encoding/json"
	"encore.app/replicache/db"
	"encore.app/types"
	"encore.dev/rlog"
	"fmt"
	"strconv"
)

const DEFAULT_SPACE_ID = "default"

func TxProcessMutation(ctx context.Context, clientID ClientID, mutation Mutation) error {
	tx, err := db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	err = ProcessMutation(ctx, db.ReplicacheDb.WithTx(tx), clientID, mutation)
	if err != nil {
		return err
	}

	err = tx.Commit(ctx)
	return err
}

func ProcessMutation(ctx context.Context, dbClient *db.Queries, clientID ClientID, mutation Mutation) error {
	prevVersion, err := dbClient.GetSpaceVersion(ctx, DEFAULT_SPACE_ID)
	if err != nil {
		return err
	}
	nextVersion := prevVersion + 1

	lastMutationID, err := GetLastMutationIDOrZero(ctx, dbClient, string(clientID), false)
	if err != nil {
		return err
	}

	nextMutationID := lastMutationID + 1

	//// It's common due to connectivity issues for clients to send a
	//// mutation which has already been processed. Skip these.
	if mutation.ID < nextMutationID {
		rlog.Info("Mutation has already been processed - skipping", "mutation", mutation.ID)
		return nil
	}
	//

	if mutation.ID > nextMutationID {
		return fmt.Errorf(`Mutation %d (%d) is from the future - aborting`, mutation.ID, nextMutationID)
	}

	switch mutation.Name {
	case "addTask":
		var msg types.Task
		if err := json.Unmarshal(mutation.Args, &msg); err != nil {
			return err
		}

		err = dbClient.InsertTasks(ctx, db.InsertTasksParams{
			Key:     fmt.Sprintf("task/%s", msg.ID),
			Type:    `task`,
			Data:    msg,
			SpaceID: DEFAULT_SPACE_ID,
			Deleted: false,
			Version: nextVersion,
		})
		if err != nil {
			return err
		}
	case "setTaskCompleted":
		var update types.TaskCompleted
		if err := json.Unmarshal(mutation.Args, &update); err != nil {
			return err
		}

		rlog.Info("Updating task", "id", update.ID, "completed", update.Completed)
		err = dbClient.UpdateTaskCompleted(ctx, db.UpdateTaskCompletedParams{
			Key:         fmt.Sprintf("task/%s", update.ID),
			Replacement: []byte(strconv.FormatBool(update.Completed)),
			Version:     nextVersion,
		})
		if err != nil {
			return err
		}
	case "deleteTask":
		var update types.TaskDeleted
		if err := json.Unmarshal(mutation.Args, &update); err != nil {
			return err
		}

		err = dbClient.MarkTaskAsDeleted(ctx, db.MarkTaskAsDeletedParams{
			Key:     fmt.Sprintf("task/%s", update.ID),
			Version: nextVersion,
		})
		if err != nil {
			return err
		}

	default:
		return fmt.Errorf(`Unknown mutation: %s`, mutation.Name)
	}
	//

	// TODO: Make this into proper UPSERT
	res, err := dbClient.UpdateLastMutationID(ctx, db.UpdateLastMutationIDParams{
		ID:             string(clientID),
		LastMutationID: nextMutationID,
	})
	if err != nil {
		return fmt.Errorf(`Failed to update last mutation ID: %w`, err)
	}
	if nRows := res.RowsAffected(); nRows != 1 {
		err = dbClient.CreateClient(ctx, db.CreateClientParams{
			ID:             string(clientID),
			LastMutationID: nextMutationID,
		})
		if err != nil {
			return fmt.Errorf(`Failed to create client: %w`, err)
		}
	}

	err = dbClient.UpdateSpaceVersion(ctx, db.UpdateSpaceVersionParams{
		ID:      DEFAULT_SPACE_ID,
		Version: nextVersion,
	})
	if err != nil {
		return err
	}

	pokeClients()

	return nil
}

func pokeClients() {
	if err := m.Broadcast([]byte("change happened")); err != nil {
		rlog.Error("poke failed")
	}
	rlog.Info("poke succesful", m.Len())
}
