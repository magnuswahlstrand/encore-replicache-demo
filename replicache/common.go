package replicache

import (
	"context"
	"encore.app/replicache/db"
)

func GetLastMutationIDOrZero(ctx context.Context, tx *db.Queries, clientID string, required bool) (int32, error) {
	lastMutationID, err := tx.GetLastMutationID(ctx, clientID)
	switch {
	case err != nil && err.Error() == "no rows in result set" && !required:
		return 0, nil
	case err != nil:
		return 0, err
	}
	return lastMutationID, nil
}
