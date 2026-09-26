---
oj: dmy
pid: '476'
title: '[R77B] 传球'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, r \le 200$，$0 \le a_i \le 10^9$。

## 思路

$n, r$ 都很小，直接逐轮模拟这 $r$ 轮操作即可。

唯一要注意的是「盒子是否传球只取决于该轮开始时的球数，本轮收到的球不会让它额外传球」。因此不能边扫描边就地修改球数，否则第 $i+1$ 个盒子用到的就不是本轮开始时的值了。

换个角度看这次操作：每个球数为奇数的盒子少一个球，并且这个球进入后一个盒子。于是第 $i$ 个盒子的新球数为

$$a_i - [\,a_i \text{ 为奇数}\,] + [\,i > 1 \text{ 且 } a_{i-1} \text{ 为奇数}\,],$$

第 $n$ 个盒子传出的球离开所有盒子，不产生 $+1$。

实现时每轮先用一个数组记下所有盒子的奇偶性，再依据上一轮的球数整体构造新数组，这样就不会把本轮的变化带进判断里。

球数增长是可控的：每轮每个盒子最多净变化 $1$，$r \le 200$，所以最终球数不超过 $10^9 + 200$，用 64 位整数即可。

## 复杂度

每轮 $O(n)$，共 $r$ 轮，时间 $O(nr)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let r = first[1]
    var a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = n
    var t: Int64 = 0
    while (t < r) {
        var odd = Array<Bool>(nn, { _ => false })
        var i: Int64 = 0
        while (i < nn) {
            odd[i] = a[i] % 2 == 1
            i += 1
        }
        var b = Array<Int64>(nn, { _ => 0 })
        i = 0
        while (i < nn) {
            var v = a[i]
            if (odd[i]) {
                v -= 1
            }
            if (i > 0 && odd[i - 1]) {
                v += 1
            }
            b[i] = v
            i += 1
        }
        a = b
        t += 1
    }
    var j: Int64 = 0
    while (j < nn) {
        if (j > 0) {
            print(" ")
        }
        print(a[j])
        j += 1
    }
    println()
}
```
