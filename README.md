# payroll

🚀 DEPLOYMENT INSTRUCTIONS
Step 1: Create Project Structure
bash
mkdir -p backend/{models,middleware,controllers,routes}
cd backend
Step 2: Copy All Files
Copy each file from above into its respective path.

Step 3: Install Dependencies
bash
npm install
Step 4: Setup Environment
bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
Step 5: Deploy to Render.com
MongoDB Atlas Setup:

Go to mongodb.com/cloud/atlas

Create FREE cluster

Create database user

Whitelist IP: 0.0.0.0/0

Copy connection string

Render.com Deployment:

Push code to GitHub

Connect to Render.com

Create Web Service

Set environment variables:

PORT=10000

HOST=0.0.0.0

MONGODB_URI=<your-mongodb-uri>

JWT_SECRET=<generate-random-32-char-string>

Deploy!

📱 API ENDPOINTS
Authentication
POST /api/auth/register - Register employee

POST /api/auth/login - Login

GET /api/auth/me - Get profile

Employees
GET /api/employees - List employees

GET /api/employees/:id - Get employee

PUT /api/employees/:id - Update employee

DELETE /api/employees/:id - Deactivate employee

Attendance
POST /api/attendance/checkin - Check in

POST /api/attendance/checkout - Check out

GET /api/attendance/history - Get history

GET /api/attendance/summary - Get summary

Payroll
GET /api/payroll - Get all payroll

GET /api/payroll/employee/:id - Get employee payroll

Leaves
POST /api/leaves - Apply leave

GET /api/leaves - Get leaves

GET /api/leaves/pending - Get pending leaves

PUT /api/leaves/:id - Approve/reject leave
