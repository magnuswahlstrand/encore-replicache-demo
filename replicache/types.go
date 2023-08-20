package replicache

import "encoding/json"

type PatchOperation struct {
	Op    string   `json:"op"`
	Key   string   `json:"key,omitempty"` // omit empty ensures that if the key is not present, it doesn't appear in the JSON output
	Value *Message `json:"value,omitempty"`
}

type Message struct {
	From    string `json:"from"`
	Content string `json:"content"`
	Order   int32  `json:"order"`
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
	Cookie         int32    `json:"cookie"`
	LastMutationID int32    `json:"last_mutation_id"`
	PullVersion    int32    `json:"pull_version"`
	SchemaVersion  string   `json:"schema_version"`
}

type PullResponse struct {
	LastMutationID int32            `json:"lastMutationID"`
	Cookie         int32            `json:"cookie"`
	Patch          []PatchOperation `json:"patch"`
}

type ClientID string

type Mutation struct {
	ID        int32
	Name      string
	Args      json.RawMessage
	Timestamp float64
}
