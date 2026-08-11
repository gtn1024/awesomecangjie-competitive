---
oj: dmy
pid: '176'
title: '[R29C]机器人移动'
difficulty: 提高
tags:
  - 贪心
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq T \leq 100$，$1 \leq X, D, A, B \leq 10^9$。

## 思路

机器人有两种移动：大跳跃一次前进 $D$ 格、代价 $A$；小碎步前进或后退 $1$ 格、代价 $B$。目标是从 $0$ 走到 $X$（不妨设 $X > 0$，由于移动可逆，负方向对称处理）。

设一共进行 $p$ 次大跳跃（均为正向）、小碎步净位移为 $X - pD$。由于小碎步可正可负，把净位移 $X - pD$ 用 $|X - pD|$ 次小碎步即可完成（正余数正向走、负余数反向走），代价为

$$
f(p) = p \cdot A + |X - pD| \cdot B.
$$

这是一个关于 $p$ 的凸函数：斜率在 $p = X/D$ 两侧发生跳跃。当 $p < X/D$ 时 $f$ 的差分（每增加一次跳跃带来的代价变化）为 $A - DB$，当 $p > X/D$ 时为 $A + DB$，因此最小值一定取在 $p = \lfloor X/D \rfloor$ 或 $p = \lceil X/D \rceil$ 附近，再额外比较 $p = 0$（全部用小碎步）即可覆盖全局最优。

所以只需比较三种方案：

- $p = 0$：全部小碎步，代价 $X \cdot B$；
- $p = \lfloor X/D \rfloor$：余数 $X - pD \geq 0$，代价 $pA + (X - pD)B$；
- $p = \lceil X/D \rceil$：跳过头，余数为正，代价 $pA + (pD - X)B$。

三者取最小值即为答案。

## 复杂度

每组数据 $O(1)$，总时间 $O(T)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

func solve(reader: ConsoleReader) {
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let X = v[0]
    let D = v[1]
    let A = v[2]
    let B = v[3]

    // f(p) = p*A + |X - p*D|*B 是关于 p 的凸函数，最小值只需检查
    // p = 0、p = floor(X/D)、p = ceil(X/D) 三种取法。
    var ans = X * B // p = 0：全部小碎步

    let pFloor = X / D
    var cost = pFloor * A + (X - pFloor * D) * B
    if (cost < ans) {
        ans = cost
    }

    let pCeil = pFloor + 1
    cost = pCeil * A + (pCeil * D - X) * B
    if (cost < ans) {
        ans = cost
    }

    println(ans)
}

main() {
    let reader = getStdIn()
    let T = Int64.parse(reader.readln().getOrThrow())
    var t = 0
    while (t < T) {
        solve(reader)
        t = t + 1
    }
}
```
