const bcrypt = require('bcryptjs');
const { STATUS_ACTIVE } = require('../constants/status');
const UserModel = require('../models/user');

const saltRounds = 10;

class UserService {
  static async insertOne(body) {
    let user = UserModel(body);
    user = await user.save();
    user = user.toObject();
    delete user.password;
    return user;
  }

  static async findByEmail(email) {
    const user = await UserModel.findOne({ email });
    return user;
  }

  static async findInOrg(oid, orgId) {
    const user = await UserModel.findOne({ _id: oid, organization: orgId });
    return user;
  }

  static async modifyByEmail(email, body) {
    const user = await UserModel.findOneAndUpdate(
      { email },
      body,
      {
        fields: { password: 0 },
        new: true,
      },
    );

    return user;
  }

  static async findByEmailInOrg(
    organization,
    email,
  ) {
    const user = await UserModel.findOne({ organization, email });
    return user;
  }

  static async updatePassByEmail(email, pwd) {
    const password = bcrypt.hashSync(pwd, saltRounds);
    const user = await UserModel.findOneAndUpdate(
      { email },
      {
        password,
      },
      {
        fields: { password: 0 },
        new: true,
      },
    );

    return user;
  }

  static async getWpgnInOrg(orgOid, type, skip, limit, search) {
    const re = new RegExp(search, 'i');
    let users = await UserModel.find({
      $and: [
        { organization: orgOid },
        { user_type: type },
        {
          $or:
            [
              { first_name: { $regex: re } },
              { last_name: { $regex: re } },
              { email: { $regex: re } },
            ],
        },
      ],

    }).select('-password');
    const totalElements = users.length;
    users = users.slice(skip, limit);
    return { data: users, pagination: { totalElements } };
  }

  static async getActivesByType(orgOid, type) {
    const users = await UserModel.find({
      organization: orgOid,
      user_type: type,
      status: STATUS_ACTIVE,
    });
    return users;
  }

  static async findInOrgByType(oid, orgId, userType) {
    const user = await UserModel.findOne({ _id: oid, organization: orgId, user_type: userType });
    return user;
  }

  static async getAllInOrg(orgOid) {
    const users = await UserModel.find({ organization: orgOid });
    return users;
  }

  static async findMultiple(arr) {
    const users = await UserModel.find({ _id: { $in: arr } }).select('first_name last_name email');
    return users;
  }

  static async modify(oid, body) {
    const updated = await UserModel.findByIdAndUpdate(
      oid,
      { $set: body },
      {
        fields: { password: 0 },
        new: true,
      },
    );

    return updated;
  }

  static async find(id) {
    const user = await UserModel.findById(id);
    return user;
  }
}

module.exports = UserService;
