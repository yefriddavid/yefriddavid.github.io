package main

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"io"
	"os"
	"os/exec"
)

type request struct {
	Binary string   `json:"binary"`
	Args   []string `json:"args"`
}

type response struct {
	Stdout   string `json:"stdout"`
	Stderr   string `json:"stderr"`
	ExitCode int    `json:"exitCode"`
	Error    string `json:"error,omitempty"`
}

func readMsg() ([]byte, error) {
	var length uint32
	if err := binary.Read(os.Stdin, binary.LittleEndian, &length); err != nil {
		return nil, err
	}
	buf := make([]byte, length)
	_, err := io.ReadFull(os.Stdin, buf)
	return buf, err
}

func writeMsg(v any) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	if err := binary.Write(os.Stdout, binary.LittleEndian, uint32(len(data))); err != nil {
		return err
	}
	_, err = os.Stdout.Write(data)
	return err
}

func main() {
	for {
		msg, err := readMsg()
		if err == io.EOF {
			return
		}
		if err != nil {
			return
		}

		var req request
		if err := json.Unmarshal(msg, &req); err != nil {
			_ = writeMsg(response{Error: "invalid request: " + err.Error()})
			continue
		}

		var stdoutBuf, stderrBuf bytes.Buffer
		cmd := exec.Command(req.Binary, req.Args...)
		cmd.Stdout = &stdoutBuf
		cmd.Stderr = &stderrBuf

		exitCode := 0
		if err := cmd.Run(); err != nil {
			if exitErr, ok := err.(*exec.ExitError); ok {
				exitCode = exitErr.ExitCode()
			} else {
				_ = writeMsg(response{Error: err.Error()})
				continue
			}
		}

		_ = writeMsg(response{
			Stdout:   stdoutBuf.String(),
			Stderr:   stderrBuf.String(),
			ExitCode: exitCode,
		})
	}
}
