import Joi from 'joi';

import { BadRequest, NotFound } from '../../utils/errors.js';
import { getAll, getById, create, deleteById } from '../../models/mongodb.js';

const collectionName = 'members';

async function getMembers(req, res) {
  const members = await getAll(collectionName);
  return await res.status(200).json({ data: members });
}

async function createMember(req, res, next) {
  const { name, email } = req.body;

  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  try {
    const value = await schema.validateAsync({ name, email });
    const member = await create(collectionName, { ...value, isActive: true });

    return res.status(201).json({
      data: {
        createdId: member.insertedId,
      },
    });
  } catch (err) {
    next(new BadRequest(err.message));
  }
}

async function getMember(req, res, next) {
  const memberId = req.params.id;
  const member = await getById(collectionName, memberId);

  if (member) {
    return await res.status(200).json({ data: member });
  }

  next(new NotFound('member not found'));
}

async function updateMember(req, res, next) {
  const memberid = req.params.id;

  next(new NotFound('member not found'));
}

async function deleteMember(req, res, next) {
  const memberId = req.params.id;
  const member = await deleteById(collectionName, memberId);

  if (member?.value) {
    return await res.sendStatus(204);
  }

  next(new NotFound('member not found'));
}

export { getMembers, createMember, getMember, updateMember, deleteMember };
