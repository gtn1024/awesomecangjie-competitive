---
oj: dmy
pid: '303'
title: '[R49A]时间循环'
difficulty: 入门
tags:
  - 数学
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 1000$，每行输入为合法的 `HH:MM` 格式时间字符串。

## 思路

把每一个时间点 `HH:MM` 换算成当天从午夜起的总分钟数 $t = HH \times 60 + MM$。小明醒来时刻对应的分钟数都是 $15$ 的倍数（$0, 15, 30, \dots, 1425$），于是**下一次醒来时刻**就是严格大于 $t$ 的最小 $15$ 倍数：

$$nt = \left(\left\lfloor \frac{t}{15} \right\rfloor + 1\right) \times 15.$$

由于题目要求「恰好醒来时刻则再算下一次（$+15$ 分钟）」，而上述公式取的是严格大于 $t$ 的倍数，恰好覆盖了这种情况，无需额外特判。

唯一需要处理的是跨天：一天共 $1440$ 分钟，当 $nt \ge 1440$（只会等于 $1440$）时，下一次醒来是第二天的 `00:00`，直接输出 `00:00` 即可。否则按 $HH = nt / 60$、$MM = nt \bmod 60$ 还原，并补零格式化为两位数。

## 复杂度

每组询问 $O(1)$，总共 $O(T)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

func solve(reader: ConsoleReader): Unit {
    let s = reader.readln().getOrThrow()
    let parts = s.split(":")
    let hh = Int64.parse(parts[0])
    let mm = Int64.parse(parts[1])
    let t = hh * 60 + mm
    var nt = (t / 15 + 1) * 15
    var nh = Int64(0)
    var nm = Int64(0)
    if (nt >= 1440) {
        nh = Int64(0)
        nm = Int64(0)
    } else {
        nh = nt / 60
        nm = nt % 60
    }
    let sh = if (nh < 10) { "0" + nh.toString() } else { nh.toString() }
    let sm = if (nm < 10) { "0" + nm.toString() } else { nm.toString() }
    println("${sh}:${sm}")
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var i = Int64(0)
    while (i < t) {
        solve(reader)
        i++
    }
}
```
