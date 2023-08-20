package replicache

import "context"

type ChangeSet struct {
	LastMutationID int              `json:"lastMutationID"`
	Cookie         int              `json:"cookie"`
	Patch          []PatchOperation `json:"patch"`
}

type PatchOperation struct {
	Op    string   `json:"op"`
	Key   string   `json:"key,omitempty"` // omit empty ensures that if the key is not present, it doesn't appear in the JSON output
	Value *Message `json:"value,omitempty"`
}

type Message struct {
	From    string `json:"from"`
	Content string `json:"content"`
	Order   int    `json:"order"`
}

//encore:api public method=POST path=/api/replicache-pull
func Pull(ctx context.Context) (*ChangeSet, error) {
	changeSet := &ChangeSet{
		LastMutationID: 1,
		Cookie:         42,
		Patch: []PatchOperation{
			{
				Op: "clear",
			},
			{
				Op:  "put",
				Key: "message/qpdgkvpb9ao",
				Value: &Message{
					From:    "Jane",
					Content: "Hey, what's for lunch?",
					Order:   1,
				},
			},
			{
				Op:  "put",
				Key: "message/5ahljadc408",
				Value: &Message{
					From:    "Fred",
					Content: "tacos?",
					Order:   2,
				},
			},
		},
	}
	return changeSet, nil
}
