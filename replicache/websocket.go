package replicache

import (
	encore "encore.dev"
	"encore.dev/rlog"
	"github.com/olahol/melody"
	"net/http"
)

var m *melody.Melody

func init() {
	m = melody.New()
}

//encore:api public raw path=/ws/:room
func Connect(w http.ResponseWriter, req *http.Request) {

	room := encore.CurrentRequest().PathParams.Get("room")
	rlog.Info("user connected to room", "room", room)
	if err := m.HandleRequest(w, req); err != nil {
		rlog.Error("connect failed")
	}
}
