const sharp = require("sharp");

function generateImage(
  inputPath = "visiting_card.png",
  outputPath = "path_to_your_images.png"
) {
  sharp(inputPath)
    .resize(639, 1014) // Resize to match printer resolution.
    .toFile(outputPath, (err, info) => {
      if (err) console.error("Error generating image:", err);
      else console.log("Image generated successfully:", info);
    });
}

function rgbToYMCK(r, g, b) {
  const c = 1 - r / 255;
  const m = 1 - g / 255;
  const y = 1 - b / 255;
  const k = Math.min(c, m, y);
  return {
    y: y - k,
    m: m - k,
    c: c - k,
    k,
  };
}

const {Jimp} = require("jimp");

async function convertToYMCK(
  inputImage = "visiting_card.png",
  outputImage = "path_to_your_images.png"
) {
  const image = await Jimp.read(inputImage);

  image.scan(
    0,
    0,
    image.bitmap.width,
    image.bitmap.height,
    function (x, pixelY, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      // Convert to YMCK
      const { y, m, c, k } = rgbToYMCK(r, g, b);

      // Update pixel data (example: setting to black for simplicity)
      this.bitmap.data[idx + 0] = c * 255;
      this.bitmap.data[idx + 1] = m * 255;
      this.bitmap.data[idx + 2] = y * 255;
    }
  );

   // Use write instead of writeAsync
   image.write(outputImage, (err) => {
    if (err) {
      console.error("Error saving image:", err);
    } else {
      console.log("Image saved successfully");
      sendToPrinter("path_to_your_images.png")
      sendToPrinters()
    }
  });


  sendToPrinter("path_to_your_images.png")
  // sendToPrinters() seems like zpl needed the java runtime environment
  // await image.writeAsync(outputImage);
}

// const zebra = require("zebra-sdk");

// export function printImage(imagePath) {
//   const printer = new zebra.Printer("192.168.0.100", 9100);

//   printer.printImage(imagePath, (err, result) => {
//     if (err) console.error("Print Error:", err);
//     else console.log("Print Success:", result);
//   });
// }

const net = require("net");
const fs = require("fs");

function sendToPrinter(
  imagePath,
  printerIP = "192.168.0.100",
  printerPort = 9100
) {
  const client = new net.Socket();
  const imageData = fs.readFileSync(imagePath); // Read the image file

  client.connect(printerPort, printerIP, () => {
    console.log("Connected to printer");
    client.write(imageData); // Send the image to the printer
    client.end();
  });

  client.on("error", (err) => {
    console.error("Printer error:", err);
  });
}

// const net = require('net');
// const fs = require('fs');
const imageToZpl = require('image-to-zpl'); // Library to convert image to ZPL

function sendToPrinters(imagePath= "path_to_your_images.png", printerIP = "192.168.0.100", printerPort = 9100) {
    const client = new net.Socket();
    
    // Read the image
    // const imageData = fs.readFileSync(imagePath);

    // Convert the image to ZPL format
    imageToZpl(imagePath).then(zplCode => {
        // Connect to the printer
        client.connect(printerPort, printerIP, () => {
            console.log('Connected to printer');
            
            // Send ZPL code to the printer
            client.write(zplCode);
            client.end();
        });

        client.on('error', (err) => {
            console.error('Printer error:', err);
        });
    }).catch(err => {
        console.error('Error converting image to ZPL:', err);
    });
}

// Example usage
// sendToPrinter('path/to/your/image.png', '192.168.1.100');

// Example usage
// const imagePath = "path_to_your_image.png";
// sendToPrinter(imagePath);

module.exports={
  generateImage,
  rgbToYMCK,
  convertToYMCK,
  sendToPrinter
}