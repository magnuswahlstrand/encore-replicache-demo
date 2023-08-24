package replicache

import (
	"context"
	"encoding/json"
	"encore.app/types"
	"encore.dev/beta/errs"
	"encore.dev/rlog"
)

//encore:api public method=POST path=/api/replicache-pull
func Pull(ctx context.Context, request *PullRequest) (*PullResponse, error) {
	resp, err := TxPull(ctx, request)
	if err != nil {
		return nil, &errs.Error{
			Code:    errs.Internal,
			Message: err.Error(),
		}
	}
	return resp, nil
}

//encore:api public method=POST path=/api/replicache-push
func Push(ctx context.Context, request *PushRequest) error {

	for _, mutation := range request.Mutations {
		// TODO: Handle result
		err := TxProcessMutation(ctx, request.ClientID, mutation)
		if err != nil {
			rlog.Error("Mutation", "mutation", mutation, "error", err)

			// TODO: Remove this
			//return &errs.Error{
			//	Code:    errs.Internal,
			//	Message: err.Error(),
			//}
		}
	}

	return nil
}

type PushRequest struct {
	ProfileID     string     `json:"profile_id"`
	ClientID      ClientID   `json:"client_id"`
	Mutations     []Mutation `json:"mutations"`
	PushVersion   int32      `json:"push_version"`
	SchemaVersion string     `json:"schema_version"`
}

type PullRequest struct {
	ProfileID      string   `json:"profile_id"`
	ClientID       ClientID `json:"client_id"`
	Cookie         *int32   `json:"cookie"`
	LastMutationID int32    `json:"last_mutation_id"`
	PullVersion    int32    `json:"pull_version"`
	SchemaVersion  string   `json:"schema_version"`
}

type PullResponse struct {
	LastMutationID int32            `json:"lastMutationID"`
	Cookie         int32            `json:"cookie"`
	Patch          []PatchOperation `json:"patch"`
}

type PatchOperation struct {
	Op    string      `json:"op"`
	Key   string      `json:"key,omitempty"`
	Value *types.Task `json:"value,omitempty"`
}

type MessageWithID struct {
	ID string `json:"id"`
	types.Task
}

type ClientID string

type Mutation struct {
	ID        int32
	Name      string
	Args      json.RawMessage
	Timestamp float64
}
