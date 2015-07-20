$(document).ready(function() {
	console.log("Hello, Aja.");
	console.log(questionAnswerTest());
});

function Question(query) {
	if (typeof query === "string") {
		this.text = query;
	} else {
		throw "Question must initialize with a query string.";
	};
	this.answers = [];

};

Question.prototype.insert = function(answer) {
	if (answer instanceof(Answer)) {
		this.answers.push(answer);
		this.answers[this.answers.length-1].question = this;
	} else {
		throw "Answer not an answer"
	};
};

function Answer(answer) {
	if (typeof answer === "string") {
		this.text = answer;
	} else {
		throw "Answer must initialize with an answer string.";
	};
	this.question = null;
};

function questionAnswerTest() {
	var sky = new Question("What color is the sky?");
	var blue = new Answer("Blue");
	var red = new Answer("Red");
	sky.insert(red);
	sky.insert(blue);
	return sky;
};