/**
 * Created by X on 2019/3/19
 * 存储登录信息
 */

function SessionLinked() {
	let SessionLinkedList = {};

	let arr = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
	let length = arr.length;
	this.save = function (option) {
		let str1 = "", str2 = "";
		for (let i = 0; i < 4; i++) {
			str1 += arr[parseInt(Math.random() * length)];
		}
		for (let i = 0; i < 6; i++) {
			str2 += arr[parseInt(Math.random() * length)];
		}
		let sid = str1 + new Date().getTime() + str2;
		SessionLinkedList[sid] = option;
		return sid;
	}

	this.get = function (sid) {
		return SessionLinkedList[sid];
	}

	this.getAll = function () {
		return SessionLinkedList;
	}

	this.clean = function (sid) {
		delete SessionLinkedList[sid];
	}
}

module.exports = new SessionLinked();