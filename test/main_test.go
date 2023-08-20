package main

import (
	"context"
	r "encore.app/replicache"
	"encore.app/replicache/db"
	"github.com/matryer/is"
	"testing"
)

func assertSpaceVersion(is *is.I, b int) {
	version, err := db.ReplicacheDb.GetSpaceVersion(context.TODO(), r.DEFAULT_SPACE_ID)
	is.NoErr(err)
	is.Equal(version, int32(b))
}

func setup(t *testing.T) *is.I {
	is := is.New(t)
	db.DB.Exec(context.TODO(), "DELETE FROM spaces")
	db.DB.Exec(context.TODO(), "DELETE FROM repliacache_clients")

	is.NoErr(db.ReplicacheDb.CreateSpace(context.TODO(), db.CreateSpaceParams{
		ID:      r.DEFAULT_SPACE_ID,
		Version: 1,
	}))
	is.NoErr(db.ReplicacheDb.CreateClient(context.TODO(), db.CreateClientParams{
		ID:             TEST_CLIENT_ID,
		LastMutationID: -1,
	}))
	return is
}

const TEST_CLIENT_ID = "TEST_CLIENT_ID"

func TestProcessMutation(t *testing.T) {
	is := setup(t)

	// Act
	err := r.ProcessMutation(context.TODO(), db.ReplicacheDb, TEST_CLIENT_ID, r.Mutation{
		ID:   1,
		Name: "test",
		//Args:      JSONValue
		Timestamp: 1,
	})
	is.NoErr(err)

	// Assert
	assertSpaceVersion(is, 2)

	// Act
	err = r.ProcessMutation(context.TODO(), db.ReplicacheDb, TEST_CLIENT_ID, r.Mutation{
		ID:   1,
		Name: "test",
		//Args:      JSONValue
		Timestamp: 1,
	})
	is.NoErr(err)

	// Assert
	assertSpaceVersion(is, 3)
}
