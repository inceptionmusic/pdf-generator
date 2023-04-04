const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const express = require("express");

const app = express();

app.use(express.json());

app.post("/pdf", (req, res) => {
  const { name, email, songTitle, writers, contributors } = req.body;

  run(name, email, songTitle, writers, contributors)
    .then(() => {
      res.setHeader("Content-Type", "application/pdf");
      var data = fs.readFileSync("./output.pdf");
      res.contentType("application/pdf");
      res.send(data);
    })
    .catch((err) => console.log(err));
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

async function run(name, email, songTitle, writers, contributors) {
  const content = await PDFDocument.load(fs.readFileSync("./source.pdf"));

  // Add a font to the doc
  const helveticaFont = await content.embedFont(StandardFonts.Helvetica);

  // Draw a number at the bottom of each page.
  // Note that the bottom of the page is `y = 0`, not the top
  const pages = await content.getPages();

  // draw current date on page 1
  pages[0].drawText(new Date().toUTCString().slice(0, 16), {
    x: 178,
    y: 541,
    size: 8,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // draw name on page 1
  pages[0].drawText(name, {
    x: 365,
    y: 540,
    size: 8,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // draw email on page 1
  pages[0].drawText(`${email}`, {
    x: 365,
    y: 526,
    size: 8,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // draw composition name on page 5
  pages[4].drawText(songTitle, {
    x: 190,
    y: 667,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // draw percentage on page 5
  let percentage = (100 / (writers.length + 2)).toFixed(1);
  let iter = 1;

  pages[4].drawText(`${percentage}%`, {
    x: 490,
    y: 592,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  for (const [i, writer] of Object.entries(writers)) {
    pages[4].drawText(`${writer.name}`, {
      x: 72,
      y: 592 - iter * 15,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    pages[4].drawText(`${writer.ipi}`, {
      x: 348,
      y: 592 - iter * 15,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    pages[4].drawText(`${percentage}%`, {
      x: 490,
      y: 592 - iter * 15,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    iter++;
  }

  pages[4].drawText(`${name}`, {
    x: 72,
    y: 592 - iter * 15,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  pages[4].drawText(`${percentage}%`, {
    x: 490,
    y: 592 - iter * 15,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // draw licensee on page 5 for writer + signature

  iter = 1;
  for (const [i, contributor] of Object.entries(contributors)) {
    pages[4].drawText(`${contributor.name}`, {
      x: 107,
      y: 460 - iter * 14.5,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    pages[4].drawText(`${contributor.role}`, {
      x: 315,
      y: 460 - iter * 14.5,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    iter++;
  }

  pages[4].drawText(`${name}`, {
    x: 325,
    y: 198,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // Write the PDF to a file
  fs.writeFileSync("./output.pdf", await content.save());
}
