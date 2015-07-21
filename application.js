$(document).ready(function() {
	console.log('Hello, Aja.');
	questionResponseTest();

	newSurveyListener();
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
			$('#newSurveyTitleForm').remove();
			showInProgressSurvey(newSurvey);
		} else {
			$('#newSurveyTitleForm').append('Survey title must be at least one letter.');
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

function compileHandlebarsTemplates() {
	var titleFormSource = $('#newTitleForm').html();
	titleFormTemplate = Handlebars.compile(titleFormSource);
};

function showInProgressSurvey(newSurvey) {

	var count = 0;
	$('#inProgressSurvey').append('<h1 id="inProgressSurveyTitle">'+ newSurvey.text +'</h1>');
	$('#inProgressSurvey').append('<div id="newQuestionContainer"></div>');

	$('#newQuestionContainer').append(titleFormTemplate({type: 'Question'}));
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
	if (!this.text || !this.text.length > 0) return false;
	return true;
};

Survey.prototype = new SurveyParent();
function Survey(options) {
	this.text = (!options['text']) ? "" : options['text']
	if (options['questions']) this.questions = options['questions'];
};

Question.prototype = new SurveyParent();
function Question(options) {
	if (!options['text']) throw('Question text is required.');
	if (!options['questionType']) throw('Question type is required.');

	this.text = options['text'];
	this.questionType = options['questionType'];
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
	if (['radial','drop-down','multi-select'].indexOf(this.questionType) != -1) {
		if(!this.isChoicesValid()) return false;
	};

	return this.constructor.prototype.isValid.apply(this);
};

Question.prototype.isChoicesValid = function() {
	if (!this.questionChoices || !this.questionChoices.length > 0) throw('A ' + this.questionType + ' question must include at least one choice.');
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

	var badRadial = new Question({
		text: 'How many fl. oz in a liter?',
		questionType: 'radial',
		questionChoices: []
	});

	// badRadial.isValid(); // expect(function() {badRadial.isValid();} ).toThrow("A radial question must include at least one choice.");
};