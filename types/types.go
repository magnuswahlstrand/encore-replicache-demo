package types

type Task struct {
	ID        string `json:"id"`
	Order     int32  `json:"order"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
}

type TaskCompleted struct {
	ID        string `json:"id"`
	Completed bool   `json:"completed"`
}
