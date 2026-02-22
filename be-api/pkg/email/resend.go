package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

const ResendAPIURL = "https://api.resend.com/emails"

type resendEmailRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
}

type resendErrorResponse struct {
	StatusCode int    `json:"statusCode"`
	Name       string `json:"name"`
	Message    string `json:"message"`
}

// sendEmail handles the common logic for sending emails via Resend
func sendEmail(toEmail, subject, htmlContent string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY environment variable is not set")
	}

	reqBody := resendEmailRequest{
		From:    "拍揪-picchu <no-reply@picchu.tw>",
		To:      []string{toEmail},
		Subject: subject,
		HTML:    htmlContent,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal email request: %w", err)
	}

	req, err := http.NewRequest("POST", ResendAPIURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("resend api returned status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

// SendPasswordResetEmail sends a password reset email via Resend API.
func SendPasswordResetEmail(toEmail, resetLink string) error {
	subject := "拍揪-重設您的密碼"
	htmlContent := fmt.Sprintf(`
			<html>
				<body>
					<h2>重設密碼請求</h2>
					<p>您好，</p>
					<p>我們收到了您重設密碼的請求。請點擊下方連結以設定新密碼：</p>
					<p><a href="%s">重設密碼</a></p>
					<p>此連結將在 1 小時後失效。</p>
					<p>如果您沒有提出此請求，請忽略此信件。</p>
					<br>
					<p>拍揪團隊敬上</p>
				</body>
			</html>
		`, resetLink)
	return sendEmail(toEmail, subject, htmlContent)
}

// SendVerificationEmail sends a verification email to the user.
func SendVerificationEmail(toEmail, verifyLink string) error {
	subject := "拍揪-請驗證您的信箱"
	htmlContent := fmt.Sprintf(`
			<html>
				<body>
					<h2>歡迎加入拍揪！</h2>
					<p>您好，</p>
					<p>感謝您的註冊。請點擊下方連結以驗證您的信箱並啟用帳號：</p>
					<p><a href="%s">驗證信箱</a></p>
					<p>如果您沒有註冊此帳號，請忽略此信件。</p>
					<br>
					<p>拍揪團隊敬上</p>
				</body>
			</html>
		`, verifyLink)
	return sendEmail(toEmail, subject, htmlContent)
}
