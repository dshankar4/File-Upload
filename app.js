var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const multer=require('multer');
var connection = mysql.createConnection({
	host     : 'localhost',
	port     : '3306',
	user     : 'root',
	password : 'root',
	database : 'shopping',
});
var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(
	express.static(path.join(__dirname + '/UI'),{ index :false })
	);
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/UI/index.html'));
});
app.post('/auth_login', function(request, response) {
	var password = request.body.password;
	var rollno   = request.body.rollno;
	if (rollno && password) {
		connection.query('SELECT * FROM accounts WHERE password = ? AND rollno = ?', [password, rollno], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.rollno = rollno;
				console.log("loggedin successfully");
			} else {
				console.log('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		console.log('Please enter Username, Password and Rollno!');
		response.end();
	}
	response.sendFile(path.join(__dirname + '/UI/file_upload.html'));
});
app.post('/auth_signup', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var rollno   = request.body.rollno;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ? AND rollno = ?', [username, password, rollno], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				if (request.session.loggedin) {
					console.log('Welcome back, ' + request.session.username + '!');
				}
			} else {
				connection.query('insert into accounts (username,password,rollno) values(?,?,?)',[username,password,rollno],function(error,results){});		
				console.log(username+"signed in successfully");
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username, Password and Rollno!');
		response.end();
	}
	response.sendFile(path.join(__dirname + '/UI/file_upload.html'));
});

const storage = multer.diskStorage({
  destination:'./images/',
  filename:function(req, file, callback) {
    var files = file.originalname;
    callback(null, files);
  }
});
const uploadImages = multer({
  storage: storage
});
app.post('/upload', uploadImages.single('file'),(req,res)=>{
	//res.render(index)
	console.log(req.file)
	if(!req.file){
		res.send("enter a search file")
	}
	else{
		const { file } = req
		connection.query('INSERT INTO FILE_UPLOAD (filename, size, path) VALUES (?, ?, ?)', [file.name, file.size, file.destination+file.filename], function(error, results){
			if(error){
				console.log("db not updated",error)
			}
			else{
				console.log("updated successfully")
				res.send("Uploaded successfully")
			}
		});
	}
})

app.listen(3000);


