---
oj: dmy
pid: '547'
title: '数位乘积'
difficulty: 提高+
tags:
  - 数位DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 10^{18}$，$1 \le K \le 10^9$。

## 思路

**先压缩乘积的取值。** 十进制数位乘积是若干个 $1\sim 9$ 的乘积，除了数字 $0$ 会把乘积直接变成 $0$ 以外，非零乘积的质因子只可能来自 $2,3,5,7$，即非零乘积一定是 7-smooth 数。反过来，任一不超过 $K$ 的 7-smooth 数都能由若干数字相乘得到，因此可以把所有不超过 $K$ 的形如 $2^a3^b5^c7^d$ 的数枚举出来（$K=10^9$ 时只有 $5194$ 个），排序后编号，作为 DP 的乘积状态。

**状态机分四类。** 处理到某一位时，当前状态是下面之一：

- `p`：编号为 `p` 的乘积，即当前乘积不超过 $K$；
- `zero`：已经出现过数字 $0$，乘积为 $0$；
- `dead`：当前乘积已经超过 $K$，且尚未出现 $0$；
- `未开始`：前面全是前导零，数字还没有真正开始。

转移：在 `p` 后接数字 $d$，$d=0$ 就转到 `zero`，$d\ge 1$ 时新乘积为 $p\cdot d$，不超过 $K$ 就查表得到编号，否则转到 `dead`。

**必须为「乘积超限」单独留一个状态。** 乘积超过 $K$ 之后再乘任何非零数字只会更大，但遇到数字 $0$ 会立刻变成乘积 $0$。也就是说超限不是永久死局：形如 $9\,0\,1$ 这种数先超限、再靠 $0$ 复活。所以 `dead` 遇到 $0$ 要转回 `zero`，而 `zero` 之后再接什么都还是 $0$。

**前导零。** 处于「未开始」时接 $0$ 仍停在「未开始」，接 $d\ge 1$ 才进入乘积 $d$ 的状态（若 $d>K$ 则进入 `dead`）。这样长度不足的数和数字以外的含义都不会被误算，同时「整个数全是 $0$」这一情况自然落在「未开始」里，最后不计入答案。

**数位 DP。** 设 $L$ 为 $N$ 的位数，从高位往低位枚举「第一个小于 $N$ 对应位的位置」：若前 $i$ 位与 $N$ 相同、第 $i$ 位填 $d<N_i$，则后面 $L-1-i$ 位可以任意填，方案数只与那一刻的状态有关。于是预先递推

$$f(r,st)=\sum_{d=0}^{9} f(r-1,\ \mathrm{trans}(st,d)),\qquad f(0,st)=[st \text{ 的乘积不超过 } K],$$

其中 $f(0,\cdot)$ 里 `zero` 与所有编号状态为 $1$，`dead` 与「未开始」为 $0$。前缀紧贴 $N$ 的那条路径只有一个状态，顺着 $N$ 的数字走一遍即可，最后再单独判定 $N$ 本身。

**取值范围。** $f(r,st)\le 10^r$，而所需的 $r$ 最多为 $L-1=18$（$N\le 10^{18}$），$10^{18}$ 仍在 `Int64` 内，答案也不超过 $N$，不会溢出；注意不要把 $f(L,\cdot)$ 也算出来，它会达到 $10^{19}$ 而溢出。

## 复杂度

设状态数 $S$（不超过 $K$ 的 7-smooth 数个数，$K=10^9$ 时 $S=5194$），位数 $L\le 19$。转移表 $O(10S)$，后缀表 $O(10LS)$，答案累加 $O(10L)$，时间 $O(10LS)$，空间 $O(LS)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*
import std.collection.*

main() {
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = parts[0]
    let k = parts[1]

    // 数位乘积的非零取值只含质因子 2、3、5、7，先枚举所有不超过 k 的这类数
    let vals = ArrayList<Int64>()
    var p2: Int64 = 1
    while (p2 <= k) {
        var p3: Int64 = p2
        while (p3 <= k) {
            var p5: Int64 = p3
            while (p5 <= k) {
                var p7: Int64 = p5
                while (p7 <= k) {
                    vals.add(p7)
                    p7 *= 7
                }
                p5 *= 5
            }
            p3 *= 3
        }
        p2 *= 2
    }
    let smooth = vals.toArray()
    sort(smooth)
    let s = smooth.size
    let zero = s
    let dead = s + 1
    let notStarted = s + 2
    let tot = s + 3

    let idx = HashMap<Int64, Int64>()
    for (i in 0..s) {
        idx[smooth[i]] = i
    }
    // tr[st * 10 + d]：状态 st 下追加数字 d 后的状态
    let tr = Array<Int64>(tot * 10, { _ => 0 })
    for (i in 0..s) {
        let v = smooth[i]
        tr[i * 10] = zero
        for (d in 1..=9) {
            let w = v * d
            if (w <= k) {
                tr[i * 10 + d] = idx[w]
            } else {
                tr[i * 10 + d] = dead
            }
        }
    }
    for (d in 0..10) {
        tr[zero * 10 + d] = zero
    }
    tr[dead * 10] = zero
    for (d in 1..=9) {
        tr[dead * 10 + d] = dead
    }
    tr[notStarted * 10] = notStarted
    for (d in 1..=9) {
        if (Int64(d) <= k) {
            tr[notStarted * 10 + d] = idx[Int64(d)]
        } else {
            tr[notStarted * 10 + d] = dead
        }
    }

    let digs = ArrayList<Int64>()
    var t = n
    while (t > 0) {
        digs.add(t % 10)
        t /= 10
    }
    let len = digs.size
    let dg = Array<Int64>(len, { _ => 0 })
    for (i in 0..len) {
        dg[i] = digs[len - 1 - i]
    }

    // f[r][st]：还剩 r 位任意填写时，从状态 st 出发能填出的合法后缀个数
    let f = Array<Array<Int64>>(len + 1, { _ => Array<Int64>(tot, { _ => 0 }) })
    for (i in 0..s) {
        f[0][i] = 1
    }
    f[0][zero] = 1
    for (r in 1..len) {
        for (st in 0..tot) {
            var sum: Int64 = 0
            for (d in 0..10) {
                sum += f[r - 1][tr[st * 10 + d]]
            }
            f[r][st] = sum
        }
    }

    var ans: Int64 = 0
    var st = notStarted
    for (i in 0..len) {
        for (d in 0..dg[i]) {
            ans += f[len - 1 - i][tr[st * 10 + d]]
        }
        st = tr[st * 10 + dg[i]]
    }
    if (st != dead && st != notStarted) {
        ans += 1
    }
    println(ans)
}
```

</details>
