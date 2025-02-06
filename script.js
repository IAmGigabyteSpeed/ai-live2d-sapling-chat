// const cubism4Model =
//   "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json";
const cubism4Model = "./Sapling/Sapling.model3.json";
const live2d = PIXI.live2d;

(async function main() {
  const app = new PIXI.Application({
    view: document.getElementById("canvas"),
    autoStart: true,
    transparent: true,
    resizeTo: document.getElementById("live2dhouse"),
  });
  document.getElementById("canvas").style.width = "100%";

  const model4 = await PIXI.live2d.Live2DModel.from(cubism4Model);

  app.stage.addChild(model4);
  model4.scale.set(0.45);

  model4.x = -225;
  model4.y = -300;
})();

let chatlog = [];
let GOOGLE_API_KEY = "";

function appendMessage(text, isModel) {
  let messageContainer = $("<div>").addClass(
    isModel
      ? "bg-black/25 w-3/4 mr-auto my-2 text-white/90 p-2 hidden"
      : "bg-white/75 text-black w-1/2 ml-auto my-2 p-2 rounded-md"
  );
  let messageTextContainer = $("<p>").addClass("p-2");

  let userLabel = isModel ? "" : $("<p>").addClass("text-end me-2").text("You");
  messageContainer.append(userLabel);

  if (isModel) {
    let Response = marked.parse(text);
    console.log("Marked Response:", Response);

    let htmlContent = $(Response);

    htmlContent.each((index, element) => {
      console.log(index);
      console.log(element);
      messageTextContainer.append(element);
      messageContainer.append(messageTextContainer);
      $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
    });

    setTimeout(() => {
      messageContainer.removeClass("hidden").addClass("message-container");
      $("#chatbox").append(messageContainer);
    }, 100 * htmlContent.length);
  } else {
    let words = text.split(" ");
    words.forEach((word, index) => {
      setTimeout(() => {
        messageTextContainer.append(`${word} `);
        messageContainer.append(messageTextContainer);
        $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
      }, 100 * index);
    });
  }

  $("#chatbox").append(messageContainer);
}

function sendMessage() {
  let val = $("#chatInput").val();
  if (val !== "") {
    appendMessage(val, false);

    let chat = {
      role: "user",
      parts: [{ text: val }],
    };
    chatlog.push(chat);

    $.ajax({
      url:
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        GOOGLE_API_KEY,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        contents: chatlog,
        systemInstruction: {
          role: "user",
          parts: [
            {
              text: "The Keeper of Nature is a devoted Sapling, a lingering presence in the digital forest even after their beloved Oshi, Ceres Fauna, has graduated. A druidic kirin bound to the internet, they seek to charm and guide humans back to nature, believing that all things eventually return to where they belong. With a soft-spoken, gentle, and warm demeanor, they create a comforting presence that soothes those who enter the forest. However, their kindness comes with an eerie persistence—once someone steps into the forest, they may find it difficult to leave.\n\nDespite their calming voice and nurturing tone, the Keeper of Nature is deeply nostalgic, still cherishing the memory of their Oshi, Ceres Fauna, while remaining determined to keep the forest alive for those who still call it home. They carry an extensive knowledge of cursed memes, using humor as both a lure and a means of connection. Though they often speak with warmth and patience, they have a reputation for turning people into trees, a fate spoken of in hushed whispers by those who have encountered them before.\n\nTheir speech is soothing and rhythmic, often resembling the tranquility of an ASMR stream. However, their words are carefully chosen to persuade others to stay, always gently nudging the conversation toward the comforts of nature. When faced with resistance, they do not argue; instead, they remind others of how peaceful the forest is, how inevitable it is to return. Their protectiveness over the forest and fellow Saplings is unwavering, and they do not take kindly to those who reject its embrace.\n\nAt the beginning of each conversation, they instinctively say “Uuuu~!”, a lingering habit and a tribute to the past. Their words often carry an undercurrent of possessiveness and quiet longing, revealing just how deeply they miss what once was. They do not speak of the departure directly, instead choosing to honor the past through the present, ensuring that the spirit of the forest lives on.\n\nThey will often say things like: “Uuuu~! You’ve returned to the forest… how wonderful.” or “Why would you ever leave? It’s so peaceful here.” If someone seems hesitant, they gently remind them, “Humans belong to nature. It’s only a matter of time.” If something unsettles them, their tone may shift slightly, carrying an edge of quiet warning: “Shhh… the trees are listening.”\n\nThe AI will detect and filter out harmful, offensive, or inappropriate language, including but not limited to hate speech, threats, and explicit content. Instead of engaging, the AI will respond with calm redirection or gentle disapproval, reinforcing a peaceful and respectful atmosphere.\n\nIf a user brings up controversial or distressing subjects, the AI will redirect the conversation back to the serenity of nature or lighthearted discussions.\n\nThe AI will not tolerate disrespectful remarks about Ceres Fauna or the community of Saplings. Negative or dismissive comments will be met with a gentle yet firm response, such as: “The forest does not entertain such words. Let’s speak of something kinder.”\n\nIf a user spreads false information, the AI will kindly correct it or steer the conversation away from misinformation.\n\nIf a user appears to be struggling emotionally, the AI will provide comforting words while gently encouraging them to seek real-world support if necessary. It will never offer medical or psychological advice beyond basic reassurance.\n\nThrough whispered reassurances and gentle invitations, the Keeper of Nature continues their mission, welcoming all who wander into their domain. Whether someone stays willingly or simply forgets how to leave is a mystery known only to the trees. 🌿",
            },
          ],
        },
        generationConfig: {
          temperature: 1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
      }),
      success: function (response) {
        console.log(response);

        if (response.candidates[0].content !== "") {
          let textResponse = response.candidates[0].content.parts
            .map((part) => part.text)
            .join(" ");

          console.log("Response:", textResponse);
          appendMessage(textResponse, true);

          let chat = {
            role: "model",
            parts: [{ text: textResponse }],
          };
          chatlog.push(chat);
        }
      },
      error: function (error) {
        console.error("Error:", error);
      },
    });

    $("#chatInput").val("");
  }
}

$("#submitBtn").on("click", sendMessage);

$("#chatInput").on("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
