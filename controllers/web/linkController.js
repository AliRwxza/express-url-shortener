const {Link, ClickEvent} = require("../../models");
const generateId = require("../../helper/generateId");
const qr = require("qrcode");
const { StatusCodes } = require("http-status-codes");
const createHttpError = require("http-errors");

const ID_LENGTH = 6;

function hasChar(string) {
  return /[a-zA-Z]/.test(string);
}

function showInsertLink(req, res) {
  res.render("links/create", {
    title: "Create a link"
  });
}

async function redirect(req, res, next) {
  const link = await Link.findOne({
    where: {alias: req.params.alias}
  });
  if (link) {
    await ClickEvent.create({
      linkId: link.id,
      ipAddress: req.socket._peername.address,
      userAgent: req.headers["user-agent"],
      referrer: req.headers.referer
    });
    
    await Link.increment("clickCount", {
      by: 1,
      where: {
        id: link.id
      }
    });

    res.render("links/redirect", {
      url: link.url
    });
  } else {
    next(createHttpError(404));
  }
}

async function insertLink(req, res) {
  const {url, expiry, givenAlias} = req.body;
  const userId = req.session.user.id;

  if (!url) {
    return res.status(StatusCodes.BAD_REQUEST).render("links/create", {
      title: "Short Links",
      error: "No URL provided"
    });
  }

  if (!givenAlias) {
    let repeat = 0;
    let genId;

    while (repeat++ < 10) {
      genId = generateId(ID_LENGTH);

      const isDup = await Link.findOne({
        where: {alias: genId}
      });

      if (!isDup && hasChar(genId)) {
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
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).render("links/create", {
        title: "My Links",
        error: "Unable to generate an alias. Please try again later."
    });
  }

  if (isDup) {
    return res.status(StatusCodes.CONFLICT).render("links/create", {
      title: "My Links",
      error: "This alias is taken"
    });
  }
  
  if (!hasChar(alias)) {
    return res.status(StatusCodes.BAD_REQUEST).render("links/create", {
      title: "My Links",
      error: "Aliases must contain atleast one letter"
    });
  }

  try {
    if (!expiry) {
      await Link.create({
        alias,
        url,
        userId
      });

    } else {
      const expiresAt = new Date(Date.now() + expiry * 1000);

      await Link.create({
        alias,
        url,
        userId,
        expiresAt
      });

      const data = await Link.findOne({
        where: {alias}
      });

      return res.status(StatusCodes.CREATED).render("links/create", {
        title: "My Short Links"
      });
    }
  } catch (err) {
    console.error(err);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render("links/create", {
      title: "My short links"
    });
  }
}

async function showLinks(req, res) {
  try {
    const userId = req.session.user.id;
    const links = await Link.findAll({
        where: {userId}
    });

    res.render("links/mylinks", {
        links
    });
  } catch(error) {
      next(error);
  }
}

function showDeleteLink(req, res, next) {
  res.render("links/delete");
}

async function deleteLink(req, res, next) {
  console.log("We're here finally")
  const {id} = req.body;

  if (!id) {
    next(createHttpError(404));
  }

  const link = await Link.findOne({
    where: {id}
  });

  if (!link) {
    res.render("/links/delete", {
      error: "Not a valid link ID"
    });
  }

  if (link.userId !== req.session.user.id) {
    res.render("/links/delete", {
      error: "You are forbidden from deleting this link"
    });
  }

  const deleted = await Link.destroy({
    where: {id}
  });

  if (deleted === 0){
    return res.render("/links/delete", {
      error: "Unable to delete this link"
    });
  }
  return res.status(204).render("/links/delete", {
    confirm: "Link deleted successfully"
  });
}

async function displayLink(req, res) {
  const {id} = req.params;
  const link = await Link.findOne({
    where: {id}
  });

  if (!link) {
    return res.status(404).render("/links/" + string(id), {
      error: "Not a valid ID"
    });
  }

  if (link.userId !== req.session.user.id) {
    return res.status(403).render("/links/", {
      error: "Your do not have access to this link"
    });
  }

  const clickEvents = await ClickEvent.findAll({
    where: {linkId: link.id}
  });

  console.log("Click event:", clickEvents);

  return res.render("links/detail", {
    link,
    clickEvents
  });
}

async function displayQr(req, res, next) {
  const {alias} = req.params;
  const link = await Link.findOne({
    attributes: [
      "expiresAt"
    ],
    where: {alias}
  });

  if (!link) {
    return next(createHttpError(404));
  }

  if (link.expiresAt && link.expiresAt <= Date.now()) {
    return res.status(410).render("/error");
  }

  const qrBuffer = await qr.toDataURL(
    `http://${process.env.DB_HOST}:${process.env.PORT}/${alias}`,
    {
      type: "png",
      width: 300,
      margin: 1
    }
  );

  return res.status(200).render("links/qr", {
    qrCode: qrBuffer,
    link
  });
}

module.exports = {
  insertLink,
  showInsertLink,
  showLinks,
  redirect,
  showDeleteLink,
  deleteLink,
  displayLink,
  displayQr
}