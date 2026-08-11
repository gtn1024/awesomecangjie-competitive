---
oj: dmy
pid: '326'
title: '[R52E] RECAL'
difficulty: 普及-
tags:
  - 交互
  - 二进制
  - 构造
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，询问次数不能超过 $17$。

## 思路

一次询问可以同时获得所有 $P[i]$ 的一位信息。

把整数 $0,1,\ldots,n-1$ 写成二进制。对于第 $k$ 个二进制位，构造询问串 $s_k$，令

$$
s_k[j]=\operatorname{bit}_k(j-1)。
$$

其中下标 $j$ 从 $1$ 开始，而二进制编码从 $0$ 开始，所以编码的是 $j-1$。

交互器返回的字符串满足

$$
t_k[i]=s_k[P[i]]=\operatorname{bit}_k(P[i]-1)。
$$

因此，固定位置 $i$，把所有询问返回的 $t_k[i]$ 按二进制位合并，就能恢复 $P[i]-1$，再加一即可得到 $P[i]$。

只需要询问

$$
q=\lceil\log_2 n\rceil
$$

次。由于 $n\le 10^5<2^{17}$，所以 $q\le 17$，满足询问次数限制。特别地，当 $n=1$ 时不需要询问，排列只能是 $[1]$。

每次输出询问后都要立即刷新输出缓冲区；输出最终答案后直接结束程序。

复杂度：共进行 $O(\log n)$ 次询问，时间复杂度为 $O(n\log n)$，额外空间复杂度为 $O(n)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main(): Int64 {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let permutation = Array<Int64>(n, { _ => 1 })

    var queries: Int64 = 0
    var capacity: Int64 = 1
    while (capacity < n) {
        queries += 1
        capacity *= 2
    }

    var bitValue: Int64 = 1
    for (_ in 0..queries) {
        let query = StringBuilder()
        for (value in 0..n) {
            if (value / bitValue % 2 == 1) {
                query.append(r'1')
            } else {
                query.append(r'0')
            }
        }
        print("? ${query.toString()}\n", flush: true)

        let response = reader.readln().getOrThrow().toRuneArray()
        for (i in 0..n) {
            if (response[i] == r'1') {
                permutation[i] += bitValue
            }
        }
        bitValue *= 2
    }

    let answer = StringBuilder()
    answer.append("!")
    for (value in permutation) {
        answer.append(" ")
        answer.append(value)
    }
    answer.append("\n")
    print(answer.toString(), flush: true)
    return 0
}
```
