package cmd

import (
	"encoding/json"
	"fmt"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"os"
)

// actual command body
var generateDocCmd = &cobra.Command{
	Use:   "generate-doc",
	Short: "Generate API documentation from test results.",
	Long:  `Generate API documentation based on test results in different formats like OpenAPI or Swagger.`,
	Run: func(cmd *cobra.Command, args []string) {
		doc := map[string]interface{}{
			"title":       "Sample API",
			"description": "Generated API documentation",
			"version":     "1.0.0",
			"endpoints": []map[string]interface{}{
				{
					"path":      "https://fakestoreapi.com/products",
					"method":    "GET",
					"summary":   "Example GET request",
					"responses": []string{"200 OK", "404 Not Found"},
				},
			},
		}

		data, err := json.MarshalIndent(doc, "", "  ")
		if err != nil {
			fmt.Printf("Error generating documentation: %v\n", err)
			return
		}

		output := viper.GetString("output")
		err = os.WriteFile(output, data, 0644)
		if err != nil {
			fmt.Printf("Error writing file: %v\n", err)
			return
		}

		fmt.Printf("Documentation generated in JSON format at %s\n", output)
	},
}

func init() {
	generateDocCmd.Flags().String("output", "./apidoc.json", "Output file path")
	viper.BindPFlag("output", generateDocCmd.Flags().Lookup("output"))
}
