var cluster = require('cluster');

function startWorker(){
	var worker = cluster.fork();
	console.log('CLUSTER : worker %d start', worker.id);
}

if(cluster.isMaster){
	require('os').cpus().forEach(function(){
		startWorker();
	});

	//记录所有断开的工作线程，如果线程断开了，它就应该退出
	//因此我们可以等待exit事件然后产生一个新的线程来替代它
	cluster.on('disconnect', function(){
		console.log('CLUSTER : worker %d disconnected from the cluster', worker.id);
	});

	//当所有的线程退出时，创建一个新的线程来替代它
	cluster.on('exit', function(worker, code, signal){
		console.log('CLUSTER : worker %d died with exit code %d (%s)', worker.id, code, signal);
		startWorker();
	});
}else{
	require('./meadowlark.js')();
}