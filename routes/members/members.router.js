import express from 'express';

import { getMembers, createMember, getMember, updateMember, deleteMember } from './members.controller.js';

const membersRouter = express.Router();

membersRouter.get('/', getMembers);
membersRouter.post('/', createMember);
membersRouter.get('/:id', getMember);
membersRouter.put('/:id', updateMember);
membersRouter.delete('/:id', deleteMember);

export default membersRouter;
