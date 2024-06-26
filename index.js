const express = require('express')
const { default: mongoose } = require('mongoose')
const redis = require('redis')

const User = require('./model/user.js')
const jwt = require('jsonwebtoken')

const port = 3000
const redisPOrt = 6379

const client = redis.createClient(redisPOrt)

const app = express()
app.use(express.json())
app.listen(port, () => {
	console.log(`App running on port ${port}`)
})

mongoose.connect(process.env.MONGODB_URL).then(()=> console.log("success")).catch((v)=>console.error(v))

const verifyToken = (req,res,next) => {
	try {
		const authHeader = req.headers['authorization'];
		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.split(' ')[1];
			jwt.verify(token,"mysecret")
			next();
		} else {
			res.status(401).json({ message: 'Unauthorized: No token provided or invalid token format' });
		}
	} catch (error) {
			res.status(401).json({ message: 'Unauthorized: No token provided or invalid token format' });
	}
}


app.get('/api/token', (req,res) => {
	try {
		const token = jwt.sign("user","mysecret")
		res.json({token:token})
	} catch (error) {
		res.json({message:error.message}).status(500)
	}
})

app.get('/api/users/:identityNumber', async (req,res) => {
	try {
		const {identityNumber} = req.params()
		client.get(identityNumber, async (err,userData) => {
			if (err) {
				console.error('Error accessing Redis:', err);
				res.status(500).json({ error: 'Internal Server Error' });
				return
			}

			if (userData) {
				console.log('User data found in Redis');
				res.status(200).json(userData);
				return
			} else {
				const user = await User.findOne({ identityNumber: identityNumber });
				res.json(user).status(200)
				return
			}
		})
	} catch (error) {
		res.json({message:error.message}).status(500)
	}
})


app.post('/api/users', verifyToken, async (req,res) => {
	try {
		const user = await User.create(req.body)
		res.json(user).status(200)

	} catch (error){
		res.json({message:error.message}).status(500)
	}
})

app.put('/api/users/:identityNumber', async (req,res) => {
	try {
		const {identityNumber} = req.params()
		const updatedUser = await User.findOneAndUpdate(
			{ identityNumber: identityNumber },
			{ $set: req.body },
			{ new: true, runValidators: true }
		)
		client.set(identityNumber,updatedUser)
		res.json(updatedUser).status(199)
	} catch (error) {
		res.json({message:error.message}).status(500)
	}

})

app.delete('/api/users/:identityNumber', async (req,res) => {
	const {identityNumber} = req.params()
	const deletedUser = await User.findOneAndDelete({ identityNumber: identityNumber });

	client.del(identityNumber)

	res.json(deletedUser)

})
