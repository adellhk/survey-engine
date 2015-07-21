$(document).ready(function() {
	console.log('Hello, Aja.');
	// questionResponseTest();

	newSurveyListener();
	newQuestionListener();
	addSubChoiceListener();

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

};

function showInProgressSurvey(newSurvey) {
	questionCount = 0;
	$('#inProgressSurvey').prepend('<h1 id="inProgressSurveyTitle">'+ newSurvey.text +'</h1>');
	$('#inProgressSurvey').append('<div id="newQuestionContainer"></div>');

	$('#newQuestionContainer').prepend(titleFormTemplate(
	{
		type: 'Question',
		count: (questionCount+1),
		newQuestion: true
	}));
};

function newQuestionListener(count) {
	$('#inProgressSurvey').on('submit', 'form', function(e) {
		e.preventDefault();

		var text = $('#newQuestionTitle').val();
		var type = $('input:radio[name=type]:checked').val();
		var number = $('#newQuestion').attr('number');
		var newQuestion = new Question({text: text, type: type, number: number});

		if (['radio', 'multi-select'].indexOf(type) != -1) {
			if (type === 'radio') {
				var choices = document.getElementById('radioChoices').children;
			} else {
				var choices = document.getElementById('multiSelectChoices').children;
			};

			for (var i = 0; i < choices.length; i++) {
				var text = choices[i].firstChild.value;

				if (text.length > 0) {
					newQuestion.questionChoices.push(text);
				};

			};

		};

		if (newQuestion.isValid()) {
			currentSurvey.insertQuestion(newQuestion);
			questionCount += 1;
		} else {
			$('#errorMessages').text(newQuestion.errors);
		};
	});

	$('#inProgressSurvey').on('change', 'input:radio[name=type]', function() {
		switch($(this).val()) {
			case 'multi-select':
				$('#radioChoices').hide();
				$('#multiSelectChoices').show();
				addSubChoice($('#multiSelectChoices'), 0);
				break;
			case 'radio':
				$('#multiSelectChoices').hide();
				$('#radioChoices').show();
				addSubChoice('#radioChoices', 0);
				break;
			default:
				$('#radioChoices').hide();
				$('#multiSelectChoices').hide();
				break;
		};
	});
};

function addSubChoice(target, count) {
	$(target).append(radioSubChoice({number: (count+1)}));
};

function addSubChoiceListener() {
	$('#inProgressSurvey').on('click', '#addSubChoice', function() {
		var option = this.previousSibling;
		if (option.value.length > 0) {
			var count = parseInt(option.getAttribute('number'));
			var listId = option.parentElement.parentElement.id;
			addSubChoice('#'+listId, count);
			$(this).remove();
		} else {
			$('#errorMessages').text('Option cannot be blank.');
		};

	});
};

function compileHandlebarsTemplates() {
	var titleFormSource = $('#newTitleForm').html();
	titleFormTemplate = Handlebars.compile(titleFormSource);

	var radioSubChoiceSource = $('#radioSubChoice').html();
	radioSubChoice = Handlebars.compile(radioSubChoiceSource);
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
		this.questions[this.questions.length-1].survey = this;
		return newQuestion;
	};
};

Question.prototype = new SurveyParent();
Question.prototype.name = 'Question';
function Question(options) {

	this.text = options['text'];
	this.number = options['number'];
	this.errors = "";
	this.questionType = options['type'];
	this.questionChoices = options['questionChoices'] || [];
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
	Response.prototype.name = "Response";
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