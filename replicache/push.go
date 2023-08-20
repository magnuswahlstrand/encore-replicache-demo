package replicache

import (
	"context"
	"encore.app/replicache/db"
	"encore.dev/rlog"
	"fmt"
)

const DEFAULT_SPACE_ID = "default"

func TxProcessMutation(ctx context.Context, clientID ClientID, mutation Mutation) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	err = ProcessMutation(ctx, db.ReplicacheDb.WithTx(tx), clientID, mutation)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func ProcessMutation(ctx context.Context, dbClient *db.Queries, clientID ClientID, mutation Mutation) error {
	prevVersion, err := dbClient.GetSpaceVersion(ctx, DEFAULT_SPACE_ID)
	if err != nil {
		return err
	}
	nextVersion := prevVersion + 1

	lastMutationID, err := dbClient.GetLastMutationID(ctx, string(clientID))
	if err != nil {
		return err
	}
	nextMutationID := lastMutationID + 1

	//const lastMutationID = await getLastMutationID(tx, clientID, false);
	//const nextMutationID = lastMutationID + 1;
	//
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
	case "createMessage":
		// Use zod to validate the mutation arguments.
		//const user = userValidation.parse(mutation.args)
		// TODO: Handle delete user
		err := dbClient.InsertMessage(ctx, db.InsertMessageParams{
			Key:     fmt.Sprintf(`message/%s`, mutation.ID),
			Type:    `message`,
			Data:    mutation.Args,
			SpaceID: DEFAULT_SPACE_ID,
			Deleted: false,
			Version: nextVersion,
		})
		if err != nil {
			return err
		}
	default:
		return fmt.Errorf(`Unknown mutation: %s`, mutation.Name)
	}
	//

	err = dbClient.UpdateLastMutationID(ctx, db.UpdateLastMutationIDParams{
		ID:             DEFAULT_SPACE_ID,
		LastMutationID: nextMutationID,
	})
	if err != nil {
		return err
	}
	err = dbClient.UpdateSpaceVersion(ctx, db.UpdateSpaceVersionParams{
		ID:      DEFAULT_SPACE_ID,
		Version: nextVersion,
	})
	if err != nil {
		return err
	}
	return nil
}
