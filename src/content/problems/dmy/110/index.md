---
oj: dmy
pid: '110'
title: '[R19B]乘法'
difficulty: 提高
tags:
  - 模拟
  - 数论
  - 高精度
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \leq T \leq 100$，$1 \leq a, b \leq 1000$，且 $|a - b| \leq 5$。

## 思路

直接计算 $X = 2^{a} \times 5^{b}$ 涉及到高达 $1000$ 位的乘幂，需要手写高精度。但题目保证 $|a - b| \leq 5$，这个条件给出了一条捷径。

把成对的一个 $2$ 和一个 $5$ 合并成一个 $10$：

$$X = 2^{a} \times 5^{b} = 2^{a-b} \times 10^{b} \quad (a \geq b)$$

或

$$X = 5^{b-a} \times 10^{a} \quad (b > a)$$

由于 $|a - b| \leq 5$，剩余的系数非常小：

- 若 $a \geq b$，系数为 $2^{a-b} \leq 2^{5} = 32$；
- 若 $b > a$，系数为 $5^{b-a} \leq 5^{5} = 3125$。

两者都可用普通整数（`Int64`）直接计算。剩下的 $10^{\min(a,b)}$ 就是一个 $1$ 后面跟 $\min(a,b)$ 个 $0$ 的字符串。所以最终的 $X$ 就是「系数的十进制表示」后接 $\min(a,b)$ 个 $0$，全程无需任何大整数乘法。

## 复杂度

时间 $O(T \cdot \min(a,b))$（输出字符数），空间 $O(\min(a,b))$（答案字符串）。在给定数据规模下远低于限制。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let a = Int64.parse(line[0])
        let b = Int64.parse(line[1])
        // 利用 |a - b| <= 5：X = 2^a * 5^b = 2^(a-b) * 10^b （a>=b）或 5^(b-a) * 10^a （b>a）
        var c: Int64 = 1
        var zeros: Int64 = 0
        if (a >= b) {
            var d = a - b
            while (d > 0) {
                c *= 2
                d -= 1
            }
            zeros = b
        } else {
            var d = b - a
            while (d > 0) {
                c *= 5
                d -= 1
            }
            zeros = a
        }
        // 直接输出 c 后跟 zeros 个 0
        print(c)
        for (_ in 0..zeros) {
            print("0")
        }
        println()
    }
}
```
