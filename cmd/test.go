package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

// command flags
var url string
var body string
var method string
var headers []string

// actual command body
var testCmd = &cobra.Command{
	Use:   "test",
	Short: "Test an  API endpoint.",
	Long:  `Test a specific API endpoint with specified HTTP method, headers, and body.`,
	Run: func(cmd *cobra.Command, args []string) {
		client := &http.Client{}
		url := viper.GetString("url")
		method := viper.GetString("method")
		body := viper.GetString("body")
		headers := viper.GetStringSlice("headers")

		req, err := http.NewRequest(method, url, strings.NewReader(body))
		if err != nil {
			log.Fatalf("Error creating request: %v", err)
		}

		for _, h := range headers {
			parts := strings.Split(h, ":")
			if len(parts) == 2 {
				req.Header.Add(strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1]))
			}
		}

		resp, err := client.Do(req)
		if err != nil {
			log.Fatalf("Error sending request: %v", err)
		}
		defer resp.Body.Close()

		responseBody, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("Error reading response: %v", err)
		}

		fmt.Printf("Status: %s\n", resp.Status)
		fmt.Printf("Response: %s\n", string(responseBody))
	},
}

func init() {
	//	assign the flags to the command
	testCmd.Flags().StringVarP(&url, "url", "u", "", "API endpoint URL")
	testCmd.Flags().StringVarP(&method, "method", "m", "GET", "HTTP method")
	testCmd.Flags().StringArrayVarP(&headers, "header", "H", []string{}, "HTTP header")
	testCmd.Flags().StringVarP(&body, "body", "b", "", "HTTP Request body")

	viper.BindPFlag("url", testCmd.Flags().Lookup("url"))
	viper.BindPFlag("method", testCmd.Flags().Lookup("method"))
	viper.BindPFlag("body", testCmd.Flags().Lookup("body"))
	viper.BindPFlag("headers", testCmd.Flags().Lookup("headers"))
}
