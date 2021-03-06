
import { Router } from 'express'
import { verify, sign } from 'jsonwebtoken';
import { compareSync, hash } from 'bcrypt'
import mongoose, { NativeError } from 'mongoose';

import { AuthenticatedUserRequest, User } from '../../interfaces/user';
import { UserModel } from '../../models/user.model';
import { RefreshTokenModel } from '../../models/token.model';
import { saveRefreshToken, signToken } from '../../utils/token-utils';
import { RefreshToken, Tokens } from '../../interfaces/tokens';
import { verifyToken } from '../../middleware/auth';

const authController = Router();

mongoose.set('useFindAndModify', false);

authController.post('/token', async (req, res) => {
	const token: string = req.body.token;

	if (!token || token === '') {
		return res.status(400).json({ error: 'Invalid parameter - token' })
	}

	const tokenDocument = await RefreshTokenModel.findOne({ token: token });
	if (!tokenDocument) {
		return res.sendStatus(403);
	}

	const refreshToken: string = (tokenDocument.toJSON() as RefreshToken).refreshToken;

	let user: User;
	try {
		user = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as User;

		const accessToken: string = sign(user, process.env.ACCESS_TOKEN_SECRET as string);
		res.status(200).json({ accessToken });
	} catch (err) {
		res.status(400).json(err);
	}
});

authController.post('/login', async (req, res) => {
	const email: string = req.body.email;
	if (!email || email === '') {
		return res.status(400).json({ error: 'Invalid email address' })
	}

	const userDocument = await UserModel.findOne({ email });
	if (!userDocument) {
		return res.status(404).json({ error: 'User does not exist' })
	}

	const user: User = userDocument.toJSON() as User;
	if (!compareSync(req.body.password, user.password)) {
		return res.status(403).json({ error: 'Invalid credentials' })
	}

	const tokens: Tokens = signToken(user);

	try {
		await saveRefreshToken(tokens.refreshToken);

		return res.json(tokens);
	} catch (err) {
		return res.json(err);
	};
});

authController.post('/register', async (req, res) => {
	const newUser = req.body as User;

	const today: Date = new Date();

	const userDocument = await UserModel.findOne({
		email: req.body.email
	});

	if (!userDocument) {
		const hashed: string = await hash(newUser.password, 10);

		const user = new UserModel({
			id: new mongoose.Types.ObjectId(),
			email: newUser.email,
			password: hashed,
			createDate: today,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			username: newUser.username
		});
		const validation: NativeError = user.validateSync();
		if (validation) {
			return res.status(400).json(validation);
		}

		await user.save();

		try {
			const tokens: Tokens = signToken(user.toJSON() as User);

			await saveRefreshToken(tokens.refreshToken)
			return res.json(tokens);
		} catch (err) {
			res.send({ error: 'There was an error signing your token' });
		}
	}

	return res.json({ error: 'User already exists' });
});

authController.post('/logout', async (req, res) => {
	const refreshToken: string = req.body.token;

	if (!refreshToken || refreshToken === '') {
		return res.status(400).json({ error: 'Invalid parameter - token' })
	}

	const tokenDocument = await RefreshTokenModel.findOneAndRemove({ refreshToken })
	if (!tokenDocument) {
		return res.status(403);
	}

	return res.status(204).send('You have been logged out');
});

authController.get('/user-info', verifyToken, async (req: AuthenticatedUserRequest, res) => {
	const user: User = (await UserModel.findOne({ email: req.user.email })).toJSON() as User;
	return res.json(
		user
	);
});

authController.post('/edit-user', verifyToken, async (req: AuthenticatedUserRequest, res) => {
	 const editUser =  await (await UserModel.findOneAndUpdate({ email: req.user.email}, {email: req.body.email, username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName})).toJSON() as User;

	 return res.status(200).json(editUser);
})

authController.get('/', async (req, res) => {
	try {
		const allFiles = await UserModel.find();
		res.status(200).json(allFiles);
	} catch (err) { 
		res.status(404).json({ message: err });
	}
})

export default authController;