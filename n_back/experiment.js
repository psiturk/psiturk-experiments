/*
reference: http://www.sciencedirect.com/science/article/pii/S1053811905001424
Cognitive control and brain resources in major depression: An fMRI study using the n-back task Harvey at al. 2005
This task differs in that the subject only has to respond on target trials, rather than indicating whether the current trial is 
a match or not
*/

/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({'exp_id': 'tone_monitoring'})
}

function evalAttentionChecks() {
  var check_percent = 1
  if (run_attention_checks) {
    var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
    var checks_passed = 0
    for (var i = 0; i < attention_check_trials.length; i++) {
      if (attention_check_trials[i].correct === true) {
        checks_passed += 1
      }
    }
    check_percent = checks_passed/attention_check_trials.length
  } 
  return check_percent
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text + '</p></div>'
}

var randomDraw = function(lst) {
    var index = Math.floor(Math.random()*(lst.length))
    return lst[index]
}

//Calculates whether the last trial was correct and records the accuracy in data object
var record_acc = function() {
	var global_trial = jsPsych.progress().current_trial_global
	var stim = jsPsych.data.getData()[global_trial].stim.toLowerCase()
	var target = jsPsych.data.getData()[global_trial].target.toLowerCase()
	var key = jsPsych.data.getData()[global_trial].key_press
	if (stim == target && key == 32) {
		jsPsych.data.addDataToLastTrial({correct: 'correct'})
	} else if (stim != target && key == -1) {
		jsPsych.data.addDataToLastTrial({correct: 'correct'})
	} else {
		jsPsych.data.addDataToLastTrial({correct: 'incorrect'})
	}
}


/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = true
var attention_check_thresh = 0.65
var sumInstructTime = 0    //ms
var instructTimeThresh = 5   ///in seconds

// task specific variables
var letters = 'bBdDgGtTvV'
var num_blocks = 2 //of each delay
var num_trials = 50
var delays = jsPsych.randomization.shuffle([1, 2, 3])
var control_before = Math.round(Math.random()) //0 control comes before test, 1, after

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
  type: 'attention-check',
  timing_response: 30000,
  response_ends_trial: true,
  timing_post_trial: 200
}

var attention_node = {
  timeline: [attention_check_block],
  conditional_function: function() {
    return run_attention_checks
  }
}

/* define static blocks */
var welcome_block = {
  type: 'poldrack-text',
  timing_response: 60000,
  text: '<div class = centerbox><p class = center-block-text>Welcome to the experiment. Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 0
};

var feedback_instruct_text = 'Starting with instructions.  Press <strong> Enter </strong> to continue.'
var feedback_instruct_block = {
  type: 'poldrack-text',
  cont_key: [13],
  text: getInstructFeedback,
  timing_post_trial: 0,
  timing_response: 6000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instruction_trials = []
var instructions_block = {
  type: 'poldrack-instructions',
  pages: [
    '<div class = centerbox><p class = block-text>In this experiment you will see a sequence of letters presented one at a time. Your job is to respond by pressing the spacebar when the letter matches the same letter that occured either 1, 2 or 3 trials before. The letters will be both lower and upper case. You should ignore the case (so "t" matches "T")</p><p class = block-text>The specific delay you should pay attention to will differ between blocks of trials, and you will be told the delay before starting a trial block.</p><p class = block-text>For instance, if the delay is 2, you are supposed to respond when the current letter matches the letter that occured 2 trials ago. If you saw the sequence: g...G...v...T...b...t, you would respond only on the last "t".</p></div>',
 	'<div class = centerbox><p class = block-text>This experiment will last around 17 minutes</p></div>'],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};
instruction_trials.push(feedback_instruct_block)
instruction_trials.push(instructions_block)

var instruction_node = {
    timeline: instruction_trials,
	/* This function defines stopping criteria */
    loop_function: function(data){
		for(i=0;i<data.length;i++){
			if((data[i].trial_type=='poldrack-instructions') && (data[i].rt!=-1)){
				rt=data[i].rt
				sumInstructTime=sumInstructTime+rt
			}
		}
		if(sumInstructTime<=instructTimeThresh*1000){
			feedback_instruct_text = 'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
			return true
		} else if(sumInstructTime>instructTimeThresh*1000){
			feedback_instruct_text = 'Done with instructions. Press <strong>enter</strong> to continue.'
			return false
		}
    }
}

var end_block = {
  type: 'poldrack-text',
  timing_response: 60000,
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 0
};

var start_practice_block = {
  type: 'poldrack-text',
  timing_response: 60000,
  text: '<div class = centerbox><p class = center-block-text>Starting a practice block.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 1000
};

var start_test_block = {
  type: 'poldrack-text',
  timing_response: 60000,
  text: '<div class = centerbox><p class = center-block-text>Starting a test block.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 1000
};

var start_control_block = {
  type: 'poldrack-text',
  timing_response: 60000,
  text: '<div class = centerbox><p class = block-text>In this block you do not have to match letters to previous letters. Instead, press the spacebar everytime you see a "t" or "T".</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 1000
};

//Define control (0-back) block
var control_trials = []
for (var i=0; i<num_trials; i++) {
	var stim = randomDraw(letters)
	var control_block = {
	  type: 'poldrack-single-stim',
	  is_html: true,
	  stimulus: '<div class = centerbox><div class = center-text>' + stim + '</div></div>',
	  data: {exp_id: "n_back", load:  0, stim: stim, target: 't'},
	  choices: [32],
	  timing_stim: 500,
	  timing_response: 2000,
	  response_ends_trial: false,
	  timing_post_trial: 0,
	  on_finish: record_acc
	};
	control_trials.push(control_block)
}

//Set up experiment
var n_back_experiment = []
n_back_experiment.push(welcome_block);
n_back_experiment.push(instruction_node);

if (control_before === 0) {
	n_back_experiment.push(start_control_block)
	n_back_experiment = n_back_experiment.concat(control_trials)
}
for (var d = 0; d<delays.length; d++) {
	var delay = delays[d]
	var start_delay_block = {
	  type: 'poldrack-text',
	  timing_response: 60000,
	  text: '<div class = centerbox><p class = block-text>In these next blocks, you should respond when the current letter matches the letter that appeared ' + delay + ' trials before.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
	  cont_key: [13]
	};
	n_back_experiment.push(start_delay_block)
	for (var b = 0; b < num_blocks; b++) {
		n_back_experiment.push(start_test_block)
		var target = ''
		var stims = []
		for (var i=0; i<num_trials; i++) {
			var stim = randomDraw(letters)
			stims.push(stim)
			if (i>=delay) {
				target = stims[i-delay]
			}
			var test_block = {
			  type: 'poldrack-single-stim',
			  is_html: true,
			  stimulus: '<div class = centerbox><div class = center-text>' + stim + '</div></div>',
			  data: {exp_id: "n_back", load:  delay, stim: stim, target: target},
			  choices: [32],
			  timing_stim: 500,
			  timing_response: 2000,
			  response_ends_trial: false,
			  timing_post_trial: 0,
			  on_finish: record_acc
			};
			n_back_experiment.push(test_block)
		}
	}
	n_back_experiment.push(attention_node)
}
if (control_before == 1) {
	n_back_experiment.push(start_control_block)
	n_back_experiment = n_back_experiment.concat(control_trials)
}
n_back_experiment.push(end_block)
