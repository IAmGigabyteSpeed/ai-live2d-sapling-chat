const cubism4Model =
  "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json";

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
  model4.scale.set(0.5);

  model4.x = -200;
})();

let chatlog = [];

function appendMessage(text, isModel) {
  let messageContainer = $("<div>").addClass(
    isModel ? "w-3/4 mr-auto my-2" : "bg-white w-1/2 ml-auto my-2"
  );
  let messageTextContainer = $("<p>").addClass("p-2");

  let userLabel = isModel ? "" : $("<p>").addClass("text-end me-2").text("You");
  messageContainer.append(userLabel);

  if (isModel) {
    let Response = marked.parse(text);
    console.log("Marked Response:", Response);

    let htmlContent = $(Response);

    htmlContent.each((index, element) => {
      setTimeout(() => {
        console.log(index);
        console.log(element);
        messageTextContainer.append(element);
        messageContainer.append(messageTextContainer);
        $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
      }, 100);
    });

    setTimeout(() => {
      messageContainer.addClass("message-container");
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
      data: JSON.stringify({ contents: chatlog }),
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
