$(document).ready(function() {
	console.log('Hello, Aja.');
	questionResponseTest();
});

function Question(options) {
	if (!options['questionText']) throw('Question text is required.');
	if (!options['questionType']) throw('Question type is required.');

	this.questionText = options['questionText'];
	this.questionType = options['questionType'];
	this.questionChoices = options['questionChoices']; // can be null, eg. open-ended question
	this.questionResponses = [];
};

Question.prototype.insertResponse = function(response) {
	if (response instanceof(Response)) {
		this.questionResponses.push(response);
		this.questionResponses[this.questionResponses.length-1].question = this;
	} else {
		throw 'Supplied response is not an instance of response.';
	};
};

Question.prototype.isValid = function() {
	if (!this.questionText.length > 0) return false;
	if (['radial','drop-down','multi-select'].indexOf(this.questionType) != -1) {
		return this.isChoicesValid();
	};
};

Question.prototype.isChoicesValid = function() {
	if (!this.questionChoices || !this.questionChoices.length > 0) throw('A ' + this.questionType + ' question must include at least one choice.');
	return true;
};

function Response(response) {
	if (typeof response === 'string') {
		this.text = response;
	} else {
		throw 'Response must initialize with a response string.';
	};
	this.question = null;
};

function questionResponseTest() {
	var sky = new Question({
		questionText: 'What color is the sky?',
		questionType: 'open-ended'
	});
	var blue = new Response('Blue');
	var red = new Response('Red');
	sky.insertResponse(red);
	sky.insertResponse(blue);
	sky.isValid();
	console.log(sky);

	var badRadial = new Question({
		questionText: 'How many fl. oz in a liter?',
		questionType: 'radial',
		questionChoices: []
	});

	// badRadial.isValid(); // expect(function() {badRadial.isValid();} ).toThrow("A radial question must include at least one choice.");
};