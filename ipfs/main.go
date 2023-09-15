package main

import (
	"net/http"
	"os"
	"io/ioutil"
	"log"
	"encoding/json"
	// "github.com/gorilla/mux"
	"crypto/sha256"
	"fmt"
)

type Attribute struct {
	TraitType string `json:"trail_type"`
	Value string `json:"value"`
}

type MetaData struct {
	Name string `json:"name"`
	Description string `json:"description"`
	Image string `json:"image"`
	Attributes []Attribute `json:"attributes"`
}

const path_images = "images/"
const path_meta_data = "meta-data/"

func getNameFile(val interface{}) string {
	data, err := json.Marshal(val)
	if err != nil {
        log.Fatal(err)
    }
	h := sha256.New()
    h.Write(data)
    bs := h.Sum(nil)
	return fmt.Sprintf("%x.json", bs)
}

func writeFile(val interface {}, nameFile string) (string, error) {
	data, err := json.Marshal(val)

	err = ioutil.WriteFile(path_meta_data + nameFile, data, 0)

    if err != nil {
		log.Println("step1:" + err.Error());
		return "", err
    }
	path := "http://localhost:" + getPort() + "/read/?meta=" + nameFile

	err = os.Chmod(path_meta_data + nameFile, 0777)
    if err != nil {
        fmt.Println("Error:", err)
        os.Exit(1)
    }
    log.Println("File permission set successfully!")

	return path, nil
}

func writeHandler(writer http.ResponseWriter, request *http.Request) {
	var metaData MetaData
	if err := json.NewDecoder(request.Body).Decode(&metaData); err != nil {
		responseWithJson(writer, http.StatusBadRequest, map[string]string{"message": "Invalid body"})
		return
	}
	path, err := writeFile(metaData, getNameFile(metaData))
	log.Println(err);
	if err != nil {
		responseWithJson(writer, 500, map[string]string{"message": err.Error(), "path": path})
	} else {
		responseWithJson(writer, 200, map[string]string{"message": "Success", "path": path})
	}
}

func readHandler(w http.ResponseWriter, r *http.Request) {
	nameFileImage, okImage := r.URL.Query()["image"]
	nameFileMeta, okMeta := r.URL.Query()["meta"]

	if okImage {
		content, err := ioutil.ReadFile(path_images + nameFileImage[0])
		if err != nil {
			responseWithJson(w, http.StatusNotFound, map[string]string{"message": err.Error()})
	    } else {
			w.Write(content)
		}
	} else if okMeta {
		content, err := ioutil.ReadFile(path_meta_data + nameFileMeta[0])
		if err != nil {
			responseWithJson(w, http.StatusNotFound, map[string]string{"message": err.Error()})
	    } else {
			w.Write(content)
		}
	} else {
		responseWithJson(w, http.StatusNotFound, map[string]string{"message": "not found"})
	}
}

func showImageHandler(w http.ResponseWriter, r *http.Request) {
	files, err := ioutil.ReadDir(path_images)
    if err != nil {
        log.Fatal(err)
    }

    for _, file := range files {
		imagePath := "http://localhost:" + getPort() + "/read/?image=" + file.Name() + " \n";
		w.Write([]byte(imagePath))
    }
}

func getPort() string {
	port := os.Getenv("PORT_SIMULATION")
	if port == "" {
		port = "3333"
	}
	return port
}

func main() {

	http.HandleFunc("/read/", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
		readHandler(w, r)
    })

	http.HandleFunc("/showImage/", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
		showImageHandler(w, r)
    })
	http.HandleFunc("/write/", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
		writeHandler(w, r)
    })
	http.ListenAndServe(":"+ getPort(), nil)
}

func responseWithJson(writer http.ResponseWriter, status int, object interface{}) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(status)
	json.NewEncoder(writer).Encode(object)
}