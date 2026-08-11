---
oj: dmy
pid: '130'
title: '[R22B]数字圆环'
difficulty: 普及/普及+
tags:
  - 数学
  - 位运算
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 50$，$s_i \in \{0, 1\}$。

## 思路

从位置 $i$ 出发顺时针走一周得到的 $n$ 位二进制数，其第 $k$ 位（最高位为第 $0$ 位）对应圆环上的数字 $s_{(i+k)\bmod n}$，权重为 $2^{n-1-k}$。

固定某个位置 $j$ 上的数字 $s_j$，当起始位置 $i$ 取遍 $0..n-1$ 时，$j$ 在所得二进制数中的位次 $k=(j-i)\bmod n$ 也取遍 $0..n-1$，所以 $s_j$ 对总和的总贡献为：

$$s_j\cdot \sum_{k=0}^{n-1}2^{n-1-k}=s_j\cdot(2^n-1)$$

于是把所有位置相加：

$$\text{答案}=(2^n-1)\cdot \text{count}_1$$

其中 $\text{count}_1$ 是字符串中 `1` 的个数。$n\le50$，$2^{50}\cdot 50\approx5.6\times10^{16}$，64 位整数足够。

## 复杂度

时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()

    // 统计 '1' 的个数
    var cnt: Int64 = 0
    for (r in s.toRuneArray()) {
        if (r == r'1') {
            cnt += 1
        }
    }

    // 计算 2^n - 1
    var pow: Int64 = 1
    for (_ in 0..n) {
        pow = pow * 2
    }

    let ans = cnt * (pow - 1)
    println(ans.toString())
    return 0
}
```
