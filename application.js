$(document).ready(function() {
	console.log('Hello, Aja.');
	questionResponseTest();

	newSurveyListener();
	surveys = [];
});

function newSurveyListener() {
	$('#newSurveyButton').click(function() {
		$(this).hide();
		$newSurveyTitleForm = $('<form id="newSurveyTitleForm"></form>');
		$newSurveyTitleForm.append('<input type="text" name="surveyTitle" id="newSurveyTitle" />');
		$newSurveyTitleForm.append('<input type="submit" value="submit" />');
		$newSurveyTitleForm.append('<input type="button" value="cancel" />');
		$('#newSurveyContainer').append($newSurveyTitleForm);
	});

	$('#newSurveyContainer').on('submit', 'form', function(e) {
		e.preventDefault();
		var surveyTitle = $('#newSurveyTitle').val();
		var newSurvey = new Survey({name: surveyTitle});
		if (newSurvey.isValid()) {
			surveys.push(newSurvey);
			$('#newSurveyTitleForm').remove();
			showInProgressSurvey(newSurvey);
		} else {
			$('#newSurveyTitleForm').append('Survey title must be at least one letter.');
		};
	});

	$('#newSurveyContainer').on('click', 'button', function() {
		console.log('hi')
		if ($(this).attr('value') == 'cancel') {
			$('#newSurveyButton').show();
			debugger; // hide the form

		};
	});

};

function showInProgressSurvey(newSurvey) {
	$('#inProgressSurvey').append('<h1 id="inProgressSurveyTitle">'+ newSurvey.name +'</h1>');
};

// Models Below


function Survey(options) {
	this.name = options['name'];
	this.questions = options['questions'];
};

Survey.prototype.isValid = function() {
	if (!this.name.length > 0) return false;
	return true;
};

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