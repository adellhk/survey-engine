$(document).ready(function() {
	console.log('Hello, AJA.');

	newSurveyListener();
	newQuestionListener();
	addSubChoiceListener();
	submitSurveyQuestionsListener();
	submitResponsesListener();
	displayExistingSurveyListener();

	surveys = [];

	compileHandlebarsTemplates();
	questionResponseTest();
	displayExistingSurveys();
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
			$('#newQuestion').remove();
			$('#newQuestionContainer').prepend(titleFormTemplate(
			{
				type: 'Question',
				count: (questionCount+1),
				newQuestion: true
			}));
			$('#newQuestion').prepend('<p>Question number ' + questionCount + ', ' + currentSurvey.questions[questionCount-1].text + ', added.</p>');
			if (!document.getElementById('submitSurveyQuestions')) $('#inProgressSurvey').append('<button id="submitSurveyQuestions">Submit Survey Questions</button>');
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

function submitSurveyQuestionsListener() {
	$('#inProgressSurvey').on('click', '#submitSurveyQuestions', function() {
		$('#inProgressSurvey').empty();
		$('#newSurveyButton').show();
		displaySurvey(currentSurvey);
		displayExistingSurveys();
	});
};

function displaySurvey(survey) {
	$('#displayedSurvey').empty();
	var title = survey.text;
	var questions = survey.questions;
	$('#displayedSurvey').append(surveyTemplate({title: title}));
	questions.forEach(function(question) {
		$('#questionList').append(displayQuestionTemplate({
			title: question.text,
			number: question.number,
			questionChoices: question.questionChoices,
			multiSelect: question.questionType === 'multi-select',
			radio: question.questionType === 'radio',
			text: question.questionType === 'text'
		}));
	});

};

function submitResponsesListener() {
	$('#displayedSurvey').on('click', '#submitResponses', function() {

		var responses = $('#questionList form');
		var passingResponses = 0;
		for (var i = 0; i < responses.length; i++) {
			var questionIndex = responses[i].getAttribute('question-number') - 1;
			var question = currentSurvey.questions[questionIndex];
			question.errors = "";

			if (question.questionType === "multi-select") {
				var checked = $('input[type=checkbox]:checked');
				var responseValue = checked.map(function(index, elem) {
					return elem.getAttribute('number');
				});
			} else if (question.questionType === 'radio') {
				var checked = $('input[type=radio]:checked');
				var responseValue = checked.map(function(index, elem) {
					return elem.getAttribute('number');
				});
			} else {
				var responseValue = responses[i].getElementsByTagName('input')[0].value;
			};
			var newResponse = new Response(responseValue, question);
			question.insertResponse(newResponse);
			if (question.errors.length > 0) {
				responses[i].appendChild(document.createTextNode(question.errors));
			} else {
				passingResponses += 1
			};
		};
		if (passingResponses == responses.length) {
			displayResponses();
		};

	});

};

function displayExistingSurveys() {
	$('#existingSurveyContainer').empty();
	for (var i = surveys.length - 1; i >= 0; i--) {
	 	$('#existingSurveyContainer').append('<button class="existing-survey" surveyNumber="' + i + '">' + surveys[i].text + '</button>');
	 };
};

function displayExistingSurveyListener() {
	$('#existingSurveyContainer').on('click', '.existing-survey', function() {
		var surveyIndex = this.getAttribute('surveyNumber');
		currentSurvey = surveys[surveyIndex];
		displaySurvey(currentSurvey);
	});
};

function displayResponses() {
	$('#displayedSurvey').empty();

	var surveyTitle = currentSurvey.text;
	var questionsAndResponses = currentSurvey.questions.map(function(question, index) {
		switch(question.questionType) {
			case 'multi-select':
				var result = question.text;
				var indices = question.responses[0].text;
				for (var i = 0; i < indices.length; i++) {
					result += " " + question.questionChoices[parseInt(indices[i])] + ".";
				};
				return result;

			case 'radio':
				var responseChoice = question.responses[0].text[0];
				return question.text + " " + question.questionChoices[responseChoice] + ".";
			case 'text':
				return question.text + " " + question.responses[0].text + ".";

		};

	});

	$('#displayedSurvey').append(displayRespondedTemplate({
		surveyTitle: surveyTitle,
		questionsAndResponses: questionsAndResponses
	}));
};

function compileHandlebarsTemplates() {
	var titleFormSource = $('#newTitleForm').html();
	titleFormTemplate = Handlebars.compile(titleFormSource);

	var radioSubChoiceSource = $('#radioSubChoice').html();
	radioSubChoice = Handlebars.compile(radioSubChoiceSource);

	var displaySurveySource = $('#displaySurvey').html();
	surveyTemplate = Handlebars.compile(displaySurveySource);

	var displayQuestionTemplateSource = $('#displayQuestionTemplate').html();
	displayQuestionTemplate = Handlebars.compile(displayQuestionTemplateSource);

	var displayRespondedTemplateSource = $('#displayRespondedTemplate').html();
	displayRespondedTemplate = Handlebars.compile(displayRespondedTemplateSource);
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
	function Response(response, question) {
		this.text = response;
		this.question = question;
	};

	Response.prototype.isValid = function() {
		var questionType = this.question.questionType;

		switch(questionType) {
			case 'multi-select':
				if (!this.text.length > 0) {
					this.question.errors += 'Multiple choice responses must include at least one selection.'
					return false;
				};
				break;
			case 'radio':
				if (!this.text.length == 1) {
					this.question.errors += "Radio responses must have exactly one selection."
					return false;
				};
				break;
			case 'text':
				if (!this.text.length > 0) {
					this.question.errors += 'Open-ended responses must be at least 1 character long.'
					return false;
				};
				break;
		};

		return true;

	};

	// tests

	function questionResponseTest() {
		var sky = new Question({
			text: 'What color is the sky?',
			type: 'text',
			number: 1
		});

		var bespin = new Question({
			text: 'What color is the sky on Bespin?',
			type: 'multi-select',
			questionChoices: ['red', 'clay', 'copper', 'blue'],
			number: 2
		});

		var hoth = new Question({
			text: 'What color is Hoth?',
			type: 'radio',
			questionChoices: ['white', 'blue', 'cold'],
			number: 3
		});

		var colorQuestions = new Survey({text: 'All About Colors'});
		colorQuestions.insertQuestion(sky);
		colorQuestions.insertQuestion(bespin);
		colorQuestions.insertQuestion(hoth);

		surveys.push(colorQuestions);
		currentSurvey = surveys[0];
};