
import { IUser } from "../../src/models/users.model";

declare global{
    namespace Express {
        interface Request {
            currentUser: IUser
        }
    }
}