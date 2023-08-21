package types

type Message struct {
	From    string `json:"from"`
	Content string `json:"content"`
	Order   int32  `json:"order"`
}
