'use strict';

// app.factory('Task', function(FURL, $firebase, Auth) {

// [AngularFire 1.1.2]
app.factory('Task', function(FURL, Auth, $firebaseObject, $firebaseArray, TaskStatus) {
  var ref = new Firebase(FURL);
  // var tasks = $firebase(ref.child('tasks')).$asArray();

  // [AngularFire 1.1.2]
  var tasks = $firebaseArray(ref.child('tasks'));
  var user = Auth.user;
  var openTaks = $firebaseArray(ref.child('tasks').orderByChild('status').equalTo('open'));

  var Task = {
    all: tasks,

    getAllOpen: openTaks,

    getTask: function(taskId) {
      // return $firebase(ref.child('tasks').child(taskId));

      // [AngularFire 1.1.2]
      return ref.child('tasks').child(taskId);
    },

    createTask: function(task) {
      task.datetime = Firebase.ServerValue.TIMESTAMP;
      return tasks.$add(task).then(function(newTask) {

        // Create User-Tasks lookup record for POSTER
        var obj = {
          taskId: newTask.key(),
          type: true,
          title: task.title
        };

        // return $firebase(ref.child('user_tasks').child(task.poster)).$push(obj);

        // [AngularFire 1.1.2] => use Firebase SDK's push() instead of $push()
        ref.child('user_tasks').child(task.poster).push(obj);

        // [Fix BUG] of creating new Task.
        return newTask;
      });
    },

    // [Adding callback onComplete]
    createUserTasks: function(taskId, onComplete) {
      // Task.getTask(taskId)
      // 	.$asObject()

      // [AngularFire 1.1.2]
      $firebaseObject(Task.getTask(taskId))
        .$loaded()
        .then(function(task) {

          // Create User-Tasks lookup record for RUNNER
          var obj = {
            taskId: taskId,
            type: false,
            title: task.title
          };

          // return $firebase(ref.child('user_tasks').child(task.runner)).$push(obj);

          // [AngularFire 1.1.2] => use Firebase SDK's push() instead of $push()
          return ref.child('user_tasks').child(task.runner).push(obj, onComplete);
        });
    },

    // [Adding callback onComplete]
    editTask: function(task, onComplete) {
      var t = this.getTask(task.$id);
      // return t.$update({title: task.title, description: task.description, total: task.total});

      // [AngularFire 1.1.2] => use Firebase SDK's update() instead of $update()
      t.update({title: task.title, description: task.description, total: task.total}, onComplete);
    },

    // [Adding callback onComplete]
    cancelTask: function(taskId, onComplete) {
      var t = this.getTask(taskId);
      // return t.$update({status: "cancelled"});

      // [AngularFire 1.1.2] => use Firebase SDK's update() instead of $update()
      // [Remember to add this status into the Firebase Security Rules for field 'status']
      t.update({status: TaskStatus.OPEN}, onComplete);
    },

    isCreator: function(task) {
      return (user && user.provider && user.uid === task.poster);
    },

    isOpen: function(task) {
      return task.status === TaskStatus.OPEN;
    },

    // --------------------------------------------------//

    isAssignee: function(task) {
      return (user && user.provider && user.uid === task.runner);
    },

    // [Adding callback onComplete]
    completeTask: function(taskId, onComplete) {
      var t = this.getTask(taskId);
      // return t.$update({status: "completed"});

      // [AngularFire 1.1.2] => use Firebase SDK's update() instead of $update()
      t.update({status: TaskStatus.COMPLETED}, onComplete);
    },

    isCompleted: function(task) {
      return task.status === TaskStatus.COMPLETED;
    }
  };

  return Task;

});
