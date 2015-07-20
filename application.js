$(document).ready(function() {
	console.log("Hello, Aja.");
	console.log(questionResponseTest());
});

function Question(options) {
	if(!options['questionText']) throw('Question text is required');
	if(!options['questionType']) throw('Question type is required');

	this.questionText = options['questionText'];
	this.questionType = options['questionType'];
	this.choices = options['choices']; // can be null, eg. open-ended question
	this.responses = [];
};

Question.prototype.insertResponse = function(response) {
	if (response instanceof(Response)) {
		this.responses.push(response);
		this.responses[this.responses.length-1].question = this;
	} else {
		throw "Response not a response.";
	};
};

Question.prototype.validate = function() {
	if (
		this.questionText.length > 0 &&
		0==0
		) {

	}
}

function Response(response) {
	if (typeof response === "string") {
		this.text = response;
	} else {
		throw "Response must initialize with an response string.";
	};
	this.question = null;
};

function questionResponseTest() {
	var sky = new Question({
		questionText: "What color is the sky?",
		questionType: "radial"
});
	var blue = new Response("Blue");
	var red = new Response("Red");
	sky.insertResponse(red);
	sky.insertResponse(blue);
	return sky;
};