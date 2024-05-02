import express from 'express';
import bodyParser from 'body-parser';
import validUrl from 'valid-url';
import { filterImageFromURL, deleteLocalFiles } from './util/util.js';

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8080;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// endpoint to filter an image from a public url.
// IT SHOULD
//    1
//    1. validate the image_url query
//    2. call filterImageFromURL(image_url) to filter the image
//    3. send the resulting file in the response
//    4. deletes any files on the server on finish of the response
// QUERY PARAMATERS
//    image_url: URL of a publicly accessible image
// RETURNS
//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

/**************************************************************************** */

//! END @TODO1

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.send(`
        <div>
            <h1>Welcome to Filtered Image App!</h1>
            <form>
              <label for="txtImageUrl">Enter an image url:</label>
              <input type="text" id="txtImageUrl" name="txtImageUrl" oninput="addValueToHyperLink(this)">
              <input type="reset" value="Clear" onclick="removeValueOfHyperLink()">
              <br>
              <a id="linkFilter" href="/filteredimage?image_url=" alt="" target="_blank">Check result</a>
            </form>
            <script>
              const startStr = "/filteredimage?image_url=";

              function addValueToHyperLink(inp){
                const val = inp.value;
                document.getElementById('linkFilter').href = startStr + val;
              }

              function removeValueOfHyperLink(){
                document.getElementById('linkFilter').href = startStr;
              }
            </script>
        </div>
    `);
});

app.get("/filteredimage", async (req, res) => {
  const imageUrl = req.query.image_url;

  // Check if image_url query parameter is present
  if (!imageUrl) {
    return res.status(400).send('image_url query parameter is required');
  }

  // Validate the image_url
  if (!validUrl.isUri(imageUrl)) {
    return res.status(400).send('Invalid image_url');
  }

  try {
    // Call filterImageFromURL to filter the image
    const filteredImagePath = await filterImageFromURL(imageUrl);

    // Send the resulting file in the response
    res.sendFile(filteredImagePath, async (err) => {
      if (err) {
        return res.status(500).send('Error sending file');
      }

      // Delete the filtered image file on finish of the response
      await deleteLocalFiles([filteredImagePath]);
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
