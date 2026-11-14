---
oj: dmy
pid: '550'
title: '属性检查'
difficulty: 提高+
tags:
  - 差分优化 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le m \le 5000$，$m < n \le 2\times 10^6$，$-m \le r_i \le m$，且所有记录中恰好有 $m$ 个 $r_i = 0$。

## 思路

**用「已加给智力的点数」作状态。** 处理到某条记录时，若此前已经出现过 $z$ 个 $0$，其中 $p$ 个加给了智力，那么当前智力恒为 $p$，力量恒为 $z-p$。也就是说，历史决策对后续的唯一影响就是这两个数字，而它们由 $(z,p)$ 完全确定，$z$ 又是随时间确定的。于是可以只维护 $dp[p]$：已获得 $z$ 点属性、其中 $p$ 点加给智力时，最多通过的检查数，其中 $0 \le p \le z$。

**每条记录的转移。** 三种记录对应三件事：

- $r_i=0$：这一点要么加给力量（$p$ 不变），要么加给智力（$p$ 加一），因此
  $$dp'[p]=\max\bigl(dp[p],\,dp[p-1]\bigr),$$
  边界 $dp'[0]=dp[0]$、$dp'[z+1]=dp[z]$，$z$ 增加 $1$。
- $r_i>0$（智力检查）：智力为 $p$，通过条件是 $p \ge r_i$。
- $r_i<0$（力量检查）：力量为 $z-p$，通过条件是 $z-p \ge -r_i$，即 $p \le z+r_i$。

后两种记录对所有 $p$ 的判定结果都是「一个区间内通过、区间外不通过」，所以它们的转移就是对一段连续的 $p$ 整体加 $1$：智力检查加在 $[r_i,z]$，力量检查加在 $[0,z+r_i]$。当 $r_i>z$ 或 $z+r_i<0$ 时区间为空，任何分配都过不了，直接跳过。

**为什么能只记差分。** 取 $\max$ 的转移只发生在 $r_i=0$ 处，而区间加可以攒在差分数组里延迟处理。于是每条记录都只做 $O(1)$ 次差分修改；遇到 $0$ 时，先把差分数组沿 $p=0,1,\dots,z$ 展开成真实的 $dp$ 值，再按上面的式子做一次原地取 $\max$（从大到小扫 $p$，避免覆盖），最后把差分数组清零。每条检查记录累计的加法一定作用在当前这层 $dp$ 上，因为两层之间的所有修改都在遇到 $0$ 时结算完毕。

**边界与初值。** 初始 $z=0$，只有 $p=0$ 一个状态，$dp[0]=0$。注意 $[0,z]$ 内的每个 $p$ 都是可达的（把 $p$ 个点随意分给智力即可），其值总是某个合法方案通过数，非负且有限，所以初值统一取 $0$ 不会污染 $\max$，也不需要负无穷哨兵。差分数组长度取 $m+3$，右端点 $z+1 \le m+1$ 时不会越界。所有记录处理完后答案还要再展开一次差分，取 $\max_{0 \le p \le m} dp[p]$。

**正确性。** 对 $z$ 归纳：$dp[p]$ 是「恰好 $p$ 点智力」这一类方案通过数的最大值，而每条检查能否通过只取决于 $p$，与具体把哪几个 $0$ 分给智力无关，因此同一类内取最大值不丢失信息；$0$ 处的取 $\max$ 恰好对应「这一点加给哪一边」的两种选择。所以归纳结束后 $dp$ 描述的就是最优分配。

## 复杂度

每条记录 $O(1)$，共 $n$ 条；每个 $0$ 处展开并清空长度为 $z+1$ 的差分数组，总计 $\sum z = O(m^2)$。时间 $O(n+m^2)$，空间 $O(m)$。输入规模达到 $2\times 10^6$ 个数，需要按字节扫描的快速读入。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0
var glen: Int64 = 0

func nextInt(): Int64 {
    while (gpos < glen && Int64(gdata[gpos]) <= 32) {
        gpos += 1
    }
    var neg = false
    if (gpos < glen && Int64(gdata[gpos]) == 45) {
        neg = true
        gpos += 1
    }
    var x: Int64 = 0
    while (gpos < glen && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    if (neg) {
        return -x
    }
    return x
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    glen = gdata.size
    let n = nextInt()
    let m = nextInt()
    let dp = Array<Int64>(m + 2, { _ => 0 })
    let diff = Array<Int64>(m + 3, { _ => 0 })
    var z: Int64 = 0
    for (_ in 0..n) {
        let r = nextInt()
        if (r == 0) {
            var cur: Int64 = 0
            for (i in 0..=z) {
                cur += diff[i]
                dp[i] += cur
            }
            for (i in 0..=(z + 1)) {
                diff[i] = 0
            }
            var p = z + 1
            while (p >= 1) {
                if (dp[p - 1] > dp[p]) {
                    dp[p] = dp[p - 1]
                }
                p -= 1
            }
            z += 1
        } else if (r > 0) {
            if (r <= z) {
                diff[r] += 1
                diff[z + 1] -= 1
            }
        } else {
            let lim = z + r
            if (lim >= 0) {
                diff[0] += 1
                diff[lim + 1] -= 1
            }
        }
    }
    var cur: Int64 = 0
    var ans: Int64 = 0
    for (i in 0..=z) {
        cur += diff[i]
        let v = dp[i] + cur
        if (v > ans) {
            ans = v
        }
    }
    println(ans)
}
```

</details>
