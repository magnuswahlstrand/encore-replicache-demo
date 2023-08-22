package types

type Task struct {
	ID        string `json:"id"`
	Order     string `json:"order"`
	Title     int32  `json:"title"`
	Completed bool   `json:"completed"`
}
