package replicache

import (
	"context"
)

//encore:api public method=POST path=/api/replicache-pull
func Pull(ctx context.Context, request *PullRequest) (*PullResponse, error) {
	return TxPull(ctx, request)
}

//encore:api public method=POST path=/api/replicache-push
func Push(ctx context.Context, request *PushRequest) error {

	for _, mutation := range request.Mutations {
		// TODO: Handle result
		_ = TxProcessMutation(ctx, request.ClientID, mutation)
	}

	return nil
}
