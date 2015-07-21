$(document).ready(function() {
	console.log('Hello, Aja.');
	questionResponseTest();

	newSurveyListener();
	newQuestionListener();

	surveys = [];

	compileHandlebarsTemplates();
});

function newSurveyListener() {
	$('#newSurveyButton').click(function() {
		$(this).hide();
	$('#newSurveyContainer').append(titleFormTemplate({type: 'Survey'}));
	});

	$('#newSurveyContainer').on('submit', 'form', function(e) {
		e.preventDefault();
		var surveyTitle = $('#newSurveyTitle').val();
		var newSurvey = new Survey({text: surveyTitle});

		if (newSurvey.isValid()) {
			surveys.push(newSurvey);
			currentSurvey = newSurvey;
			$('#newSurvey').remove();
			showInProgressSurvey(newSurvey);
		} else {
			$('#errorMessages').text(newSurvey.errors);
		};
	});

	// $('#newSurveyContainer').on('click', 'button', function() {
	// 	console.log('hi')
	// 	if ($(this).attr('value') == 'cancel') {
	// 		$('#newSurveyButton').show();
	// 		debugger; // hide the form

	// 	};
	// });

};

function newQuestionListener() {
	$('#inProgressSurvey').on('submit', 'form', function(e) {
		e.preventDefault();

		var newQuestion = new Question({text: $('#newQuestionTitle')})
	});
};

function showInProgressSurvey(newSurvey) {

	var count = 0;
	$('#inProgressSurvey').prepend('<h1 id="inProgressSurveyTitle">'+ newSurvey.text +'</h1>');
	$('#inProgressSurvey').append('<div id="newQuestionContainer"></div>');

	$('#newQuestionContainer').prepend(titleFormTemplate(
	{
		type: 'Question',
		count: (count+1),
		newQuestion: true
	}));
};

function newQuestionListener(count) {
	$('#inProgressSurvey').on('submit', 'form', function(e) {
		e.preventDefault();

		var text = $('#newQuestionTitle').val();
		var type = $('input:radio[name=type]:checked').val();
		var newQuestion = new Question({text: text, type: type});
		if (newQuestion.isValid()) {
			currentSurvey.insertQuestion(newQuestion);
		} else {
			$('#errorMessages').text(newQuestion.errors);
		};
	});
};

function compileHandlebarsTemplates() {
	var titleFormSource = $('#newTitleForm').html();
	titleFormTemplate = Handlebars.compile(titleFormSource);
};

// Models Below

function SurveyParent(options) {
	if (options && options['text']) {
		this.text = options['text']
	} else {
		this.text = "";
	};
};

SurveyParent.prototype.isValid = function() {
	if (!this.text || !this.text.length > 0) {
		this.errors += (this.name + " text must be at least one character.")
		return false;
	};
	return true;
};

Survey.prototype = new SurveyParent();
Survey.prototype.name = 'Survey';
function Survey(options) {
	this.text = (!options['text']) ? "" : options['text']
	options['questions'] ? this.questions = options['questions'] : this.questions = [];
	this.errors = "";
};

Survey.prototype.insertQuestion = function(newQuestion) {
	if (newQuestion instanceof(Question) && newQuestion.isValid()) {
		this.questions.push(newQuestion);
	};
};

Question.prototype = new SurveyParent();
Question.prototype.name = 'Question';
function Question(options) {
	// if (!options['text']) throw('Question text is required.');
	// if (!options['questionType']) throw('Question type is required.');

	this.text = options['text'];
	this.errors = "";
	this.questionType = options['type'];
	this.questionChoices = options['questionChoices']; // can be null, eg. open-ended question
	this.responses = [];
};

Question.prototype.insertResponse = function(response) {
	if (response instanceof(Response) && response.isValid()) {
		this.responses.push(response);
		this.responses[this.responses.length-1].question = this;
	} else {
		throw 'Supplied response is not a valid response.';
	};
};

Question.prototype.isValid = function() {
	if (!this.questionType) {
		this.errors += ('No question type selected (eg. radio, multiple-choice, or open-ended');
		return false;
	};
	if (['radio','drop-down','multi-select'].indexOf(this.questionType) != -1) {
		if(!this.isChoicesValid()) return false;
	};

	return this.constructor.prototype.isValid.apply(this);
};

Question.prototype.isChoicesValid = function() {
	if (!this.questionChoices || !this.questionChoices.length > 0) {
		this.errors += ('A ' + this.questionType + ' question must include at least one choice.')
		return false;
	};
	return true;
};

Response.prototype = new SurveyParent();
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
		text: 'What color is the sky?',
		questionType: 'open-ended'
	});
	var blue = new Response('Blue');
	var red = new Response('Red');
	sky.insertResponse(red);
	sky.insertResponse(blue);
	sky.isValid();
	console.log(sky);

	var badRadio = new Question({
		text: 'How many fl. oz in a liter?',
		questionType: 'radio',
		questionChoices: []
	});

	// badRadio.isValid(); // expect(function() {badRadio.isValid();} ).toThrow("A radio question must include at least one choice.");
};