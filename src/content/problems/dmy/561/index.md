---
oj: dmy
pid: '561'
title: '数组行走'
difficulty: 提高
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le t \le 10^4$，$2 \le n \le 10^5$，$1 \le k \le n-1$，$0 \le z \le \min(5,k)$，$1 \le a_i \le 10^4$，所有测试用例的 $n$ 之和不超过 $3\times 10^5$。

## 思路

**每次向左都必然配一次向右。** 因为不能连续两步向左，所以除了整条路径的最后一步，每次向左之后紧接着的一步一定是向右，而且回到原来的位置。这样的一次「左—右」往返净位移为 $0$，只是把位置 $p$ 与 $p+1$ 又各访问一次，多拿 $a_p+a_{p+1}$ 分。于是路径只有两种形态：

- 形态一：$j$ 次向左全部是往返，最后一步向右；
- 形态二：$j-1$ 次往返，最后一步独自向左（$j\ge 1$）。

两种形态都只由「净前进了多远」和「往返了几次」决定。

**形态一。** 向右共 $R=k-j$ 步，其中 $j$ 步用于往返，所以净前进 $F=k-2j$，最远只到位置 $F$（往返不产生新的最远点）。往返只能发生在满足 $p+1\le F$ 的相邻对上：位置一旦超过 $F$ 就无法再返回终点。每做一次往返，得分就多一份 $a_p+a_{p+1}$；各次往返互不影响，一路向右时在 $p+1$ 处顺路做完即可，因此每一轮都取前缀里和最大的相邻对最优。记

$$best[i]=\max_{0\le p\le i-1}\left(a_p+a_{p+1}\right)$$

（$i$ 为长度，$i=0$ 时不存在这样的对），则形态一的得分是 $pre[F]+j\cdot best[F]$，其中 $pre$ 为前缀和，$pre[i]=a_1+\dots+a_{i+1}$，下标从 $0$ 起。

**形态二。** 最后一步向左时，向右的 $k-j$ 步里有 $j-1$ 步用于往返返回，净前进 $P=k-2j+1$，最后一步从 $P$ 向左走到 $P-1$ 结束。此前的 $j-1$ 次往返仍受 $p+1\le P$ 限制，于是得分是

$$pre[P]+(j-1)\cdot best[P]+a_{P-1}.$$

形态二不能省略。例如 $a=\{10^4,10^4,1,1,1\}$、$k=4$、$z=2$：形态一最多只能到 $F=2$，最好得分是 $pre[2]+best[2]=2\times10^4+1+2\times10^4=4\times10^4+1$；而走位 $1\to2\to1\to2\to1$ 在最高的一对上往返一次、再单独向左收尾，得分为 $5\times10^4$，比它大得多。若只枚举形态一就会在这类数据上出错。

**枚举与边界。** 对 $j=0,1,\dots,\min(z,k)$ 分别计算两种形态并取最大值：

- 形态一要求 $j=0$ 或 $F\ge 1$——$j\ge 1$ 时必须存在一个可往返的相邻对；
- 形态二要求 $j\ge 1$ 且 $P\le n-1$（保证收尾的向左不出界）。

由于 $2j\le k$ 保证了 $F\ge 0$，只需再判上述条件。$z=0$ 时只剩「一路向右」，答案就是 $a_1+\dots+a_{k+1}$；$k=1$ 且 $z\ge 1$ 时两种形态里合法的只有 $pre[1]=a_1+a_2$，与直觉一致。

`best` 可以递推：$best[i]=\max\left(best[i-1],\ a_{i-1}+a_i\right)$，于是每组只需 $O(n)$ 预处理加 $O(z)$ 枚举。

## 复杂度

每组测试用例时间 $O(n+z)$，空间 $O(n)$（前缀和与 `best`）。总体时间 $O\left(\sum n\right)$，空间 $O(\max n)$。

## 仓颉实现

`best` 的首项初始化为 $-1$ 作为哨兵：$a_i\ge 1$，真实的相邻对之和恒为正，配合「$j\ge 1$ 时要求 $F\ge 1$」的判定即可避免取到非法状态。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let n = head[0]
        let k = head[1]
        let z = head[2]
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

        let pre = Array<Int64>(n, { _ => 0 })
        pre[0] = a[0]
        for (i in 1..n) {
            pre[i] = pre[i - 1] + a[i]
        }

        // best[i] = max(a[p] + a[p + 1]) over 0 <= p <= i - 1
        let best = Array<Int64>(n, { _ => -1 })
        for (i in 1..n) {
            let cand = a[i - 1] + a[i]
            best[i] = if (i >= 2 && best[i - 1] > cand) { best[i - 1] } else { cand }
        }

        var ans: Int64 = -1
        var j: Int64 = 0
        while (j <= z && 2 * j <= k) {
            let f = k - 2 * j
            // 最后一步向右：最远到 f，做 j 次「左-右」循环
            if (j == 0 || f >= 1) {
                var val = pre[f]
                if (j > 0) {
                    val += j * best[f]
                }
                if (val > ans) {
                    ans = val
                }
            }
            // 最后一步向左：最远到 f + 1，做 j - 1 次循环，最后左到 f
            let pp = f + 1
            if (j >= 1 && pp <= n - 1) {
                var val = pre[pp] + a[pp - 1]
                if (j >= 2) {
                    val += (j - 1) * best[pp]
                }
                if (val > ans) {
                    ans = val
                }
            }
            j += 1
        }
        println(ans)
    }
}
```

</details>
