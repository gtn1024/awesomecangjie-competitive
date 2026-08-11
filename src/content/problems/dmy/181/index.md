---
oj: dmy
pid: '181'
title: '[R30B]爬楼梯'
difficulty: 入门
tags:
  - 排序
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 10000$，$1 \le N \le 10^6$，$0 \le M \le N$，$\sum M \le 10^6$。

## 思路

从第 $0$ 级出发，每步向上走 $1$ 或 $2$ 级。因为一步最多跨 $2$ 级，所以一旦出现两段**连续或相邻**的坏台阶（即排序后相邻两个坏台阶编号之差不超过 $1$），它们之间就被彻底封死，无法通过。

反过来，若任意相邻坏台阶的编号差至少为 $2$，则人总能找到落脚点：每次遇到坏台阶时，从它前一级直接跨两步越过即可。此外，终点第 $N$ 级本身若是坏的，显然也无法到达。

于是只需把坏台阶编号升序排序，检查两个条件：第 $N$ 级是否坏掉；是否存在相邻坏台阶编号差不超过 $1$。两者都不触发输出 `Yes`，否则输出 `No`。

## 复杂度

每组数据排序 $O(M \log M)$，扫描 $O(M)$。总和 $O(\sum M \log M)$，可以通过。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

main(): Int64 {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let n = line[0]
        let m = line[1]
        if (m == 0) {
            reader.readln()
            println("Yes")
        } else {
            let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
            sort(a)
            var ok = true
            if (a[m - 1] == n) {
                ok = false
            }
            if (ok) {
                for (i in 0..m - 1) {
                    if (a[i + 1] - a[i] <= 1) {
                        ok = false
                        break
                    }
                }
            }
            println(if (ok) { "Yes" } else { "No" })
        }
    }
    return 0
}
```
