const Link = require("../models/Link");
const ClickEvent = require("../models/ClickEvent");
const responseHandler = require("../helper/responseHandler");
const { StatusCodes } = require("http-status-codes");
const generateId = require("../helper/generateId");
const qr = require("qrcode");

const ID_LENGTH = 6;

function hasChar(string) {
  return /[a-zA-Z]/.test(string);
}

async function insertLink(req, res) {
  const url = req.body.url;
  const expiry = req.body.expiry;
  const userId = req.user.userId;
  const givenAlias = req.body.alias;
  var alias;
  if (!url) {
    return responseHandler(
      res, 
      StatusCodes.BAD_REQUEST, 
      {message: "URL not provided."}
    );
  }
  if (!givenAlias) {
    let repeat = 0;
    let genId;
    while (repeat++ < 10) {
      genId = generateId(ID_LENGTH);
      const isDup = await Link.findOne({
        where: {alias: genId}
      });
      if (!isDup && /[a-zA-Z]/.test(genId)) {
        alias = genId;
        break;
      }
    } 
  } else {
    alias = givenAlias;
  }
  const isDup = await Link.findOne({
    where: {alias}
  });
  if (!givenAlias && (!hasChar(alias) || isDup)) {
    return responseHandler(
      res,
      StatusCodes.SERVICE_UNAVAILABLE,
      {
        message: "Unable to generate an alias. Please try again later."
      }
    );
  }
  if (isDup) {
    return responseHandler(
      res,
      StatusCodes.CONFLICT,
      {
        message: "This alias is taken"
      }
    );
  }
  if (!hasChar(alias)) {
    return responseHandler(
      res,
      StatusCodes.BAD_REQUEST,
      {
        message: "Aliases must contain atleast one letter"
      }
    );
  }
  try {
    if (!expiry) {
      await Link.create({
        alias, 
        url, 
        userId
      });
    } else {
      const expiresAt = new Date(Date.now() + expiry*1000);
      await Link.create({
        alias,
        url,
        userId,
        expiresAt
      });
    }
    const data = await Link.findOne({
      where: {alias}
    });
    const {id, ...returnLink} = data.toJSON();
    return responseHandler(
      res,
      StatusCodes.CREATED,
      {
        link: returnLink,
        message: "Short link created"
      }
    );
  } catch (err) {
    console.error(err);
    return responseHandler(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        error: "Internal server error"
      }
    );
  }
}

async function deleteLink(req, res) {
  const userId = req.user.userId;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return responseHandler(
      res,
      StatusCodes.BAD_REQUEST,
      {
        message: "ID must be an integer"
      }
    );
  }
  const link = await Link.findOne({
    attributes: [
      "userId"
    ],
    where: {id}
  });
  if (!link) {
    return responseHandler(
      res,
      StatusCodes.NOT_FOUND,
      {
        message: "Requested link not found"
      }
    );
  }
  if (link.userId !== userId) {
    return responseHandler(
      res,
      StatusCodes.FORBIDDEN,
      {
        message: "User not allowed to remove the desired link"
      }
    );
  }
  const deleted = await Link.destroy({
    where: {id}
  });
  if (deleted > 0) {
    return responseHandler(
      res,
      StatusCodes.NO_CONTENT,
      {}
    );
  } else {
    return responseHandler(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Unable to delete the link"
      }
    );
  }
}

async function retrieveLinks(req, res) {
  const userId = req.user.userId;
  try {
    const rows = await Link.findAll({
      where: {userId}
    });
    return responseHandler(
      res,
      StatusCodes.OK,
      {
        rows,
        message: "Links retrieved successfully"
      }
    )
  } catch (err) {
    console.error(err);
    return responseHandler(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Internal server error"
      }
    );
  }
}

async function getLink(req, res) {
  const userId = req.user.userId;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return responseHandler(
      res,
      StatusCodes.BAD_REQUEST,
      {
        message: "ID must be an integer"
      }
    );
  }
  const link = await Link.findOne({
    where: {id}
  });
  if (!link) {
    return responseHandler(
      res,
      StatusCodes.NOT_FOUND,
      {
        message: "No link found with this id"
      }
    );
  }
  if (link.userId !== userId) {
    return responseHandler(
      res,
      StatusCodes.UNAUTHORIZED,
      {
        message: "You do not have access to this link's information"
      }
    )
  }
  const clickEvent = await ClickEvent.findOne({
    where: {linkId: id}
  });
  if (!clickEvent) {
    return responseHandler(
      res,
      StatusCodes.OK,
      {
        link,
        message: "Found link successfully. No click events have been recorded yet."
      }
    );
  }
  return responseHandler(
    res,
    StatusCodes.OK,
    {
      link,
      clickEvent,
      message: "Retrieved successfully."
    }
  );
}

async function getLinkQR(req, res) {
  const alias = req.params.alias;
  const link = await Link.findOne({
    attributes: [
      "expiresAt"
    ],
    where: {alias}
  });
  if (!link) {
    return responseHandler(
      res,
      StatusCodes.NOT_FOUND,
      {
        message: "No link found with the provided alias"
      }
    );
  }
  if (link.expiresAt && link.expiresAt <= Date.now()) {
    return responseHandler(
      res,
      StatusCodes.GONE,
      {
        message: "The provided link is expired"
      }
    );
  }

  const qrBuffer = await qr.toBuffer(
    `http://${process.env.DB_HOST}:${process.env.PORT}/${alias}`,
    {
      type: "png",
      width: 300,
      margin: 1
    }
  );

  return responseHandler(
    res,
    StatusCodes.OK,
    qrBuffer,
    type="image"
  );
}

async function redirect(req, res) {
  const alias = req.params.alias;

  const url = await Link.findOne({
    attributes: [
      "id",
      "url",
      "expiresAt"
    ],
    where: {alias}
  });

  if (!url) {
    return responseHandler(
      res,
      StatusCodes.NOT_FOUND,
      {
        message: "Invalid short link"
      }
    )
  }
  if (url.expiresAt && url.expiresAt < Date.now()) {
    return responseHandler(
      res,
      StatusCodes.GONE,
      {
        message: "This short link is expired"
      }
    );
  }
  await ClickEvent.create({
    linkId: url.id,
    ipAddress: req.socket._peername.address,
    userAgent: req.headers["user-agent"],
    referrer: req.headers.referer
  });
  await Link.increment("clickCount", {
    by: 1,
    where: {
      id: url.id
    }
  });

  responseHandler(
    res,
    StatusCodes.MOVED_TEMPORARILY,
    {
      message: "Redirecting..."
    },
    "json",
    {
      Location: url.url
    }
  );
}

module.exports = {
  insertLink,
  deleteLink,
  retrieveLinks,
  getLink,
  getLinkQR,
  redirect
}