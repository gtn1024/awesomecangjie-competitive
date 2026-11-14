---
oj: dmy
pid: '557'
title: '朱鹮对怪兽'
difficulty: 普及+
tags:
  - 完全背包
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le H \le 10^4$，$1 \le N \le 10^3$，$1 \le A_i,B_i \le 10^4$。

## 思路

把「用若干次魔法」看成一个背包：每种魔法是一件重量为 $A_i$、代价为 $B_i$ 的物品，每件物品可以取任意多次，要求总重量达到 $H$，最小化总代价。区别在于本题允许**超过** $H$——最后一次魔法可以打超，所以这是「凑够型」完全背包，而不是「恰好装满型」。

**状态定义。** 设 $f(h)$ 为「造成的总伤害不少于 $h$ 时，所需的最小魔力」。这里的关键是让状态直接表示「至少」而不是「恰好」：一旦伤害越过 $H$，多出来的部分对胜负没有任何影响，用「至少」定义就不必再关心到底超出了多少。

**转移。** 考虑最后一次施法，若它用的是第 $i$ 种魔法，那么在此之前已经造成的伤害至少要有 $\max(0, h-A_i)$，于是

$$f(h)=\min_{i}\left(f\big(\max(0,h-A_i)\big)+B_i\right),\qquad f(0)=0 .$$

这里的 $f(0)=0$ 对应「不需要造成任何伤害」，而不是从负伤害转移，因此负数下标统一用 $\max(0,\cdot)$ 截到 $0$。

**截断。** 上式中的 $h$ 取值到 $H$ 就够了，超过 $H$ 的状态全部并入 $h=H$：如果某种方案造成了 $H+k$ 点伤害，那么同一组魔法造成的伤害当然也不少于 $H$，$f(H)$ 不会比它更差；反之 $f(H)$ 的方案本身就可能打超。所以可以把转移改写成

$$f\big(\min(h+A_i,\,H)\big)\leftarrow\min\big(f(\min(h+A_i,H)),\ f(h)+B_i\big),$$

只保留大小 $H+1$ 的一维数组，超出的部分直接截到 $H$。题目「最后一下可以打超」的规则正是被这个截断正确处理的地方；若按「恰好 $H$」做完全背包，就必须额外枚举最后一下的溢出量，而用「至少」定义则一步到位。

**计算顺序。** 按完全背包的习惯，对每种魔法依次处理，并在处理该魔法时让 $h$ 从 $0$ 单调递增地松弛。递增方向使得 $f(h)$ 被更新后又可以作为更小编号处（同一轮中已经算出的）状态的来源，也就是同一种魔法可以被使用多次；而由于 $A_i\ge 1$，目标下标 $\min(h+A_i,H)$ 恒大于 $h$，$h=H$ 不会被当作来源，因此截断后的状态既不会自我加强，也不会破坏顺序性。每轮只松弛一次遍历，做完 $N$ 轮后 $f$ 就是全部魔法任意组合的最优值。

**边界。** $H=1$ 时数组只有两个元素，任取一种魔法即可一次解决，答案就是 $\min B_i$。初始化时 `dp[0] = 0`、其余为足够大的正数；答案取 `dp[H]`。

## 复杂度

时间 $O(NH)$：每种魔法扫一遍 $H$ 个状态，$N\le 10^3$、$H\le 10^4$，约 $10^7$ 次操作。空间 $O(H)$，只需要一个长度为 $H+1$ 的数组。

## 仓颉实现

状态按「至少造成多少伤害」定义后，转移只需把目标下标截到 $H$，因此用一个一维数组原地松弛即可。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let hn = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let H = hn[0]
    let N = hn[1]
    let INF: Int64 = 1 << 60
    let dp = Array<Int64>(H + 1, { _ => INF })
    dp[0] = 0
    for (_ in 0..N) {
        let ab = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let a = ab[0]
        let b = ab[1]
        var d = 0
        while (d < H) {
            let nd = if (d + a > H) { H } else { d + a }
            if (dp[d] + b < dp[nd]) {
                dp[nd] = dp[d] + b
            }
            d += 1
        }
    }
    println(dp[H])
}
```

</details>
